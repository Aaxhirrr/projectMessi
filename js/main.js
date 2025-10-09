const doc = document;
const cursor = doc.querySelector('.cursor');
const interactiveTargets = doc.querySelectorAll('a, button, .project-card, .portal-card, .stat');

const getAnime = () => window.anime;

if (cursor) {
  doc.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  interactiveTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

const fadeIns = doc.querySelectorAll('.fade-in');
if (fadeIns.length) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  fadeIns.forEach((el) => observer.observe(el));
}

doc.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const target = doc.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const initAnimations = () => {
  const animeLib = getAnime();
  if (!animeLib) return;

  animeLib({
    targets: '.nav',
    opacity: [0, 1],
    translateY: [-50, 0],
    duration: 800,
    easing: 'easeOutExpo',
    delay: 200,
  });

  animeLib({
    targets: ['.hero-title', '.hero-subtitle', '.hero-cta'],
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 900,
    easing: 'easeOutExpo',
    delay: animeLib.stagger(200, { start: 300 }),
  });

  animeLib({
    targets: '.floating-element',
    opacity: [0, 0.1],
    scale: [0, 1],
    duration: 2000,
    easing: 'easeOutExpo',
    delay: animeLib.stagger(300, { start: 1200 }),
  });

  animeLib({
    targets: '.project-card',
    opacity: [0, 1],
    translateY: [100, 0],
    scale: [0.8, 1],
    duration: 1000,
    easing: 'easeOutExpo',
    delay: animeLib.stagger(200, { start: 1500 }),
  });
};

window.addEventListener('load', () => {
  const loader = doc.getElementById('loader');
  if (!loader) {
    initAnimations();
    return;
  }

  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      initAnimations();
    }, 500);
  }, 2000);
});

const animateCardHover = (card) => {
  card.addEventListener('mouseenter', () => {
    const animeLib = getAnime();
    if (!animeLib) return;
    const image = card.querySelector('.project-image');
    const content = card.querySelector('.project-content');
    if (image) {
      animeLib({
        targets: image,
        scale: 1.1,
        duration: 500,
        easing: 'easeOutQuart',
      });
    }
    if (content) {
      animeLib({
        targets: content,
        translateY: [-10, 0],
        duration: 300,
        easing: 'easeOutQuart',
      });
    }
  });

  card.addEventListener('mouseleave', () => {
    const animeLib = getAnime();
    if (!animeLib) return;
    const image = card.querySelector('.project-image');
    if (image) {
      animeLib({
        targets: image,
        scale: 1,
        duration: 500,
        easing: 'easeOutQuart',
      });
    }
  });
};

doc.querySelectorAll('.project-card').forEach(animateCardHover);

doc.querySelectorAll('.portal-card').forEach((card) => {
  card.addEventListener('mouseenter', () => card.classList.add('is-hovered'));
  card.addEventListener('mouseleave', () => card.classList.remove('is-hovered'));
});

let careerChartInstance = null;
const statElements = doc.querySelectorAll('[data-stat-key]');
const playerStatElements = doc.querySelectorAll('[data-player-stat]');
const deltaElements = doc.querySelectorAll('[data-delta-stat]');

const formatInitialValue = (el) => {
  const precision = Number(el.dataset.precision || 0);
  el.textContent = Number(0).toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

[statElements, playerStatElements, deltaElements].forEach((list) => {
  list.forEach(formatInitialValue);
});

const animateCounter = (element, target) => {
  const value = Number(target);
  if (!element || !Number.isFinite(value)) return;
  const precision = Number(element.dataset.precision || 0);
  const formatter = (num) =>
    Number(num).toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

  const animeLib = getAnime();
  if (!animeLib) {
    element.textContent = formatter(value);
    return;
  }

  animeLib({
    targets: { count: 0 },
    count: value,
    duration: 2000,
    easing: 'easeOutExpo',
    update: (anim) => {
      const current = anim.animatables[0].target.count;
      element.textContent = formatter(current);
    },
  });
};

const resolvePath = (root, path) => {
  if (!root) return undefined;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), root);
};

const statsObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targetValue = Number(entry.target.dataset.statValue);
        if (Number.isFinite(targetValue)) {
          animateCounter(entry.target, targetValue);
          obs.unobserve(entry.target);
        }
      }
    });
  },
  { threshold: 0.35 }
);

const registerForAnimation = (el) => statsObserver.observe(el);

statElements.forEach(registerForAnimation);
playerStatElements.forEach(registerForAnimation);
deltaElements.forEach(registerForAnimation);

const populateStats = (dataset) => {
  if (!dataset?.players?.messi) return;
  const { messi, ronaldo } = dataset.players;

  const assignValue = (el, value) => {
    if (!Number.isFinite(value)) return;
    el.dataset.statValue = value;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom >= 0;
    if (inView) {
      statsObserver.unobserve(el);
      animateCounter(el, value);
    }
  };

  statElements.forEach((el) => {
    const key = el.dataset.statKey;
    const value = resolvePath(messi, key.replace('messi.', ''));
    assignValue(el, Number(value));
  });

  playerStatElements.forEach((el) => {
    const path = el.dataset.playerStat;
    const [playerKey, ...rest] = path.split('.');
    const player = dataset.players[playerKey];
    const value = resolvePath(player, rest.join('.'));
    assignValue(el, Number(value));
  });

  deltaElements.forEach((el) => {
    const path = el.dataset.deltaStat;
    const precision = Number(el.dataset.precision || 0);
    const messiValue = Number(resolvePath(messi, path));
    const ronaldoValue = Number(resolvePath(ronaldo, path));
    if (!Number.isFinite(messiValue) || !Number.isFinite(ronaldoValue)) return;
    const diff = messiValue - ronaldoValue;
    el.dataset.precision = precision;
    assignValue(el, diff);
  });
};

const renderCareerChart = (dataset) => {
  const canvas = doc.getElementById("careerChart");
  if (!canvas || !window.Chart) return;
  const seasons = (dataset.players?.messi?.seasons ?? [])
    .map((season) => {
      const label = season.season;
      const startYear = Number(label?.split("-")[0]) || Number(label?.slice(0, 4));
      return {
        label,
        startYear,
        ga: Number(season.ga || 0),
        goals: Number(season.goals || 0),
        assists: Number(season.assists || 0),
      };
    })
    .filter((season) => season.label && Number.isFinite(season.startYear))
    .sort((a, b) => a.startYear - b.startYear);

  if (!seasons.length) return;

  const labels = seasons.map((season) => season.label);
  const ga = seasons.map((season) => season.ga);
  const goals = seasons.map((season) => season.goals);
  const assists = seasons.map((season) => season.assists);
  const ctx = canvas.getContext("2d");
  if (careerChartInstance) {
    careerChartInstance.destroy();
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(196, 255, 0, 0.35)");
  gradient.addColorStop(1, "rgba(196, 255, 0, 0.05)");
  careerChartInstance = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "line",
          label: "Goals + Assists",
          data: ga,
          borderColor: "rgba(196, 255, 0, 0.9)",
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 3,
        },
        {
          type: "line",
          label: "Goals",
          data: goals,
          borderColor: "rgba(111, 207, 255, 0.9)",
          borderDash: [6, 4],
          fill: false,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          type: "bar",
          label: "Assists",
          data: assists,
          backgroundColor: "rgba(255, 88, 139, 0.35)",
          borderRadius: 12,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#ffffff" },
        },
      },
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.6)" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          ticks: { color: "rgba(255,255,255,0.6)" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
      },
    },
  });
};



fetch('data/mvsr-data.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error('Failed to fetch dataset');
    return response.json();
  })
  .then((data) => {
    populateStats(data);
    renderCareerChart(data);
    const fetchedAt = doc.querySelector('[data-fetched-at]');
    if (fetchedAt && data.fetchedAt) {
      fetchedAt.textContent = new Date(data.fetchedAt).toLocaleString(undefined, { dateStyle: 'medium' });
    }
  })
  .catch(() => {
    const fetchedAt = doc.querySelector('[data-fetched-at]');
    if (fetchedAt) fetchedAt.textContent = '--';
  });

const parallaxElements = doc.querySelectorAll('.floating-element');
if (parallaxElements.length) {
  window.addEventListener(
    'scroll',
    () => {
      const scrolled = window.pageYOffset * 0.5;
      parallaxElements.forEach((el, index) => {
        const offset = scrolled / (index + 2);
        el.style.transform = `translate3d(0, ${-offset}px, 0)`;
      });
    },
    { passive: true }
  );
}

let gradientAngle = 0;
const heroTitle = doc.querySelector('.hero-title');
if (heroTitle) {
  setInterval(() => {
    gradientAngle = (gradientAngle + 1) % 360;
    heroTitle.style.backgroundImage = `linear-gradient(${gradientAngle}deg, var(--accent-green), #ffffff, var(--accent-green))`;
  }, 50);
}

const createParticle = () => {
  const particle = doc.createElement('div');
  particle.style.position = 'fixed';
  particle.style.width = '4px';
  particle.style.height = '4px';
  particle.style.background = 'var(--accent-green)';
  particle.style.borderRadius = '50%';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '999';
  particle.style.opacity = '0.3';
  particle.style.left = `${Math.random() * window.innerWidth}px`;
  particle.style.top = `${Math.random() * window.innerHeight}px`;

  doc.body.appendChild(particle);

  const animeLib = getAnime();
  if (animeLib) {
    animeLib({
      targets: particle,
      translateY: -100,
      opacity: [0.3, 0],
      duration: 3000,
      easing: 'easeOutQuad',
      complete: () => particle.remove(),
    });
  } else {
    particle
      .animate(
        [
          { transform: 'translateY(0)', opacity: 0.3 },
          { transform: 'translateY(-100px)', opacity: 0 },
        ],
        { duration: 3000, easing: 'ease-out', fill: 'forwards' }
      )
      .finished.then(() => particle.remove())
      .catch(() => particle.remove());
  }
};

setInterval(createParticle, 3000);

const yearEl = doc.querySelector('[data-year]');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

let threeBundle = null;

const loadThreeBundle = async () => {
  if (threeBundle) return threeBundle;
  const [THREE, loaderModule, controlsModule] = await Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/controls/OrbitControls.js'),
  ]);
  threeBundle = {
    THREE,
    GLTFLoader: loaderModule.GLTFLoader,
    OrbitControls: controlsModule.OrbitControls,
  };
  return threeBundle;
};

const initTrophyScene = async () => {
  const container = doc.querySelector('[data-trophy-canvas]');
  if (!container) return;
  const supportsWebGL =
    typeof window.WebGLRenderingContext !== 'undefined' &&
    (() => {
      const canvas = doc.createElement('canvas');
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      );
    })();
  if (!supportsWebGL) {
    container.textContent = 'WebGL not supported on this device.';
    container.style.display = 'grid';
    container.style.placeItems = 'center';
    return;
  }

  try {
    const { THREE, GLTFLoader, OrbitControls } = await loadThreeBundle();
    const { clientWidth: width, clientHeight: height } = container;
    container.textContent = '';

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(2, 4, 5);
    scene.add(directional);

    const rimLight = new THREE.DirectionalLight(0xffffaa, 0.6);
    rimLight.position.set(-2, 1.5, -3);
    scene.add(rimLight);

    const hemi = new THREE.HemisphereLight(0xffffee, 0x202020, 0.6);
    scene.add(hemi);

    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      "assets/models/world_cup_trophy.glb",
      (gltf) => {
        model = gltf.scene;

        // First, log all meshes to see what we're dealing with
        console.log('=== All meshes in model ===');
        model.traverse((child) => {
          if (child.isMesh) {
            const mat = Array.isArray(child.material) ? child.material[0] : child.material;
            const color = mat?.color;
            const vertCount = child.geometry?.attributes.position?.count || 0;
            console.log('Mesh:', {
              name: child.name,
              vertCount,
              color: color ? `rgb(${color.r}, ${color.g}, ${color.b})` : 'none'
            });
          }
        });

        // Filter out any weird meshes (like balloons) based on color or geometry
        model.traverse((child) => {
          if (child.isMesh) {
            // Check if mesh has a green/lime colored material (the balloon)
            if (child.material) {
              const mat = Array.isArray(child.material) ? child.material[0] : child.material;
              if (mat.color) {
                // Remove meshes with bright green/lime color (likely the balloon)
                const isGreenish = mat.color.g > 0.5 && mat.color.r < 0.7;
                if (isGreenish) {
                  console.log('✓ Removing green mesh (balloon):', child.name, mat.color);
                  child.visible = false;
                  return;
                }
              }
            }

            // Also check geometry - if it's a torus or has weird vertex count, hide it
            if (child.geometry) {
              const vertCount = child.geometry.attributes.position?.count || 0;
              // Balloons/torus typically have specific vertex patterns
              if (vertCount > 50000 || child.geometry.type === 'TorusGeometry') {
                console.log('✓ Removing suspicious geometry:', child.name, vertCount);
                child.visible = false;
              }
            }
          }
        });

        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const targetHeight = 2.6;
        const scale = targetHeight / maxAxis;
        model.scale.setScalar(scale);
        model.position.y -= 0.6;

        scene.add(model);
        controls.target.set(0, 0, 0);
        console.info('Trophy model loaded', { size, scale });
      },
      undefined,
      (error) => {
        console.error('Trophy GLB failed to load', error);
        container.textContent = 'Unable to load trophy model.';
        container.style.display = 'grid';
        container.style.placeItems = 'center';
      }
    );

    // fallback helper geometry if the model fails silently
    if (!model) {
      const helperGeometry = new THREE.TorusKnotGeometry(0.9, 0.24, 120, 16);
      const helperMaterial = new THREE.MeshStandardMaterial({
        color: 0xc4ff00,
        metalness: 0.4,
        roughness: 0.35,
        emissive: 0x112244,
        emissiveIntensity: 0.4,
      });
      const helperMesh = new THREE.Mesh(helperGeometry, helperMaterial);
      helperMesh.visible = false;
      scene.add(helperMesh);
      model = helperMesh;
    }

    const baseYOffset = -0.6;
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      if (model) {
        model.rotation.y = elapsed * 0.3;
        const bob = Math.sin(elapsed * 1.2) * 0.05;
        model.position.y = baseYOffset + bob;
        model.visible = true;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', onResize);
  } catch (error) {
    console.error('Three.js viewer failed to initialize:', error);
    container.textContent = '3D viewer unavailable.';
    container.style.display = 'grid';
    container.style.placeItems = 'center';
  }
};

initTrophyScene();

const initSortableTables = () => {
  doc.querySelectorAll('table[data-sortable]').forEach((table) => {
    const tbody = table.tBodies[0];
    const headers = table.querySelectorAll('th[data-sort]');
    if (!tbody || !headers.length) return;

    headers.forEach((header, headerIndex) => {
      header.addEventListener('click', () => {
        const ascending = header.dataset.dir !== 'asc';
        const rows = Array.from(tbody.querySelectorAll('tr'));

        const getCellValue = (row, idx) => {
          const cell = row.children[idx];
          if (!cell) return '';
          const valueAttr = cell.getAttribute('data-value') ?? cell.getAttribute('data-stat-value');
          if (valueAttr !== null) {
            if (!Number.isNaN(Number(valueAttr))) return Number(valueAttr);
            return valueAttr.toString().toLowerCase();
          }
          const text = cell.textContent.trim();
          const numeric = Number(text.replace(/[^0-9.-]/g, ''));
          if (!Number.isNaN(numeric) && text !== '') return numeric;
          return text.toLowerCase();
        };

        rows.sort((a, b) => {
          const aValue = getCellValue(a, headerIndex);
          const bValue = getCellValue(b, headerIndex);
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return ascending ? aValue - bValue : bValue - aValue;
          }
          return ascending
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        });

        rows.forEach((row) => tbody.appendChild(row));
        headers.forEach((h) => delete h.dataset.dir);
        header.dataset.dir = ascending ? 'asc' : 'desc';
      });
    });
  });
};

initSortableTables();



