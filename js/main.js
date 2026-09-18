/* =========================================================
   Carmen Moreno Morales — Portfolio
   Script único: menú móvil, carrusel de proyectos, detalle de
   proyecto (con enlace propio por URL), lightbox de fotos,
   animaciones de entrada y año del pie.
   ========================================================= */

(function () {
  'use strict';

  var animacionReducida = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menú móvil ---------- */
  var botonMenu = document.getElementById('menu-btn');
  var nav = document.getElementById('nav');

  if (botonMenu && nav) {
    var alternarMenu = function (abrir) {
      document.body.classList.toggle('nav-abierta', abrir);
      document.body.classList.toggle('sin-scroll', abrir);
      botonMenu.setAttribute('aria-expanded', String(abrir));
      botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    };

    botonMenu.addEventListener('click', function () {
      alternarMenu(!document.body.classList.contains('nav-abierta'));
    });

    // En móvil el menú tapa la pantalla entera: al pulsar un enlace se cierra
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) alternarMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-abierta')) {
        alternarMenu(false);
      }
    });
  }

  /* ---------- Carrusel ---------- */
  var carrusel = document.querySelector('.carrusel');

  if (carrusel) {
    var pista = carrusel.querySelector('.carrusel__pista');
    var items = Array.prototype.slice.call(pista.querySelectorAll('.carrusel__item'));
    var anterior = carrusel.querySelector('.carrusel__btn--anterior');
    var siguiente = carrusel.querySelector('.carrusel__btn--siguiente');
    var contenedorPuntos = carrusel.querySelector('.carrusel__puntos');
    var puntos = [];

    if (contenedorPuntos) {
      items.forEach(function (item, i) {
        var punto = document.createElement('button');
        punto.type = 'button';
        punto.className = 'carrusel__punto';
        punto.setAttribute('aria-label', 'Ir al proyecto ' + (i + 1));
        punto.addEventListener('click', function () { irA(i); });
        contenedorPuntos.appendChild(punto);
        puntos.push(punto);
      });
    }

    var indiceActual = function () {
      // El item cuyo borde izquierdo está más cerca del scroll actual
      var mejor = 0;
      var minima = Infinity;
      items.forEach(function (item, i) {
        var distancia = Math.abs(item.offsetLeft - pista.scrollLeft);
        if (distancia < minima) { minima = distancia; mejor = i; }
      });
      return mejor;
    };

    var irA = function (i) {
      var destino = items[Math.max(0, Math.min(i, items.length - 1))];
      pista.scrollTo({
        left: destino.offsetLeft,
        behavior: animacionReducida ? 'auto' : 'smooth'
      });
    };

    var actualizar = function () {
      var i = indiceActual();
      puntos.forEach(function (punto, j) {
        punto.setAttribute('aria-current', String(j === i));
      });
      if (anterior) anterior.disabled = pista.scrollLeft <= 4;
      if (siguiente) {
        // Margen de 4px: los navegadores no siempre llegan al máximo exacto
        siguiente.disabled = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
      }
    };

    if (anterior) anterior.addEventListener('click', function () { irA(indiceActual() - 1); });
    if (siguiente) siguiente.addEventListener('click', function () { irA(indiceActual() + 1); });

    pista.addEventListener('scroll', function () {
      window.clearTimeout(pista._temporizador);
      pista._temporizador = window.setTimeout(actualizar, 90);
    }, { passive: true });

    window.addEventListener('resize', actualizar);
    actualizar();
  }

  /* ---------- Detalle de proyecto ---------- */
  var detalle = document.getElementById('detalle');

  if (detalle) {
    var cuerpoDetalle = detalle.querySelector('.detalle__cuerpo');
    var cerrarDetalle = detalle.querySelector('.detalle__cerrar');
    var focoPrevio = null;
    var abiertoAhora = null;

    var montarVideo = function () {
      var hueco = cuerpoDetalle.querySelector('[data-video]');
      if (!hueco) return;
      // El iframe se crea al abrir, no al cargar: si no, la página
      // arrastraría nueve reproductores de YouTube desde el principio.
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' +
                   hueco.getAttribute('data-video') + '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = hueco.getAttribute('data-titulo') || 'Reproductor de vídeo';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
                     'gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      hueco.appendChild(iframe);
    };

    var abrirDetalle = function (clave, actualizarUrl) {
      var fuente = document.getElementById('fuente-' + clave);
      if (!fuente) return;

      focoPrevio = document.activeElement;
      abiertoAhora = clave;

      cuerpoDetalle.innerHTML = fuente.innerHTML;
      montarVideo();
      cuerpoDetalle.scrollTop = 0;

      detalle.hidden = false;
      detalle.scrollTop = 0;
      document.body.classList.add('sin-scroll');
      requestAnimationFrame(function () { detalle.classList.add('visible'); });
      if (cerrarDetalle) cerrarDetalle.focus();

      if (actualizarUrl && window.history.pushState) {
        window.history.pushState({ proyecto: clave }, '', '#' + clave);
      }
    };

    var cerrar = function (actualizarUrl) {
      if (detalle.hidden) return;
      abiertoAhora = null;
      detalle.classList.remove('visible');
      document.body.classList.remove('sin-scroll');
      window.setTimeout(function () {
        detalle.hidden = true;
        cuerpoDetalle.innerHTML = '';   // detiene el vídeo
      }, 300);

      if (actualizarUrl && window.history.pushState) {
        window.history.pushState({}, '', window.location.pathname + window.location.search);
      }
      if (focoPrevio) { focoPrevio.focus(); focoPrevio = null; }
    };

    document.addEventListener('click', function (e) {
      var disparador = e.target.closest('[data-proyecto]');
      if (!disparador) return;
      e.preventDefault();
      abrirDetalle(disparador.getAttribute('data-proyecto'), true);
    });

    if (cerrarDetalle) cerrarDetalle.addEventListener('click', function () { cerrar(true); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !detalle.hidden) cerrar(true);
    });

    // Atrás y adelante del navegador, y enlaces directos a un proyecto
    window.addEventListener('popstate', function () {
      var clave = window.location.hash.replace('#', '');
      if (clave && document.getElementById('fuente-' + clave)) {
        if (clave !== abiertoAhora) abrirDetalle(clave, false);
      } else {
        cerrar(false);
      }
    });

    var claveInicial = window.location.hash.replace('#', '');
    if (claveInicial && document.getElementById('fuente-' + claveInicial)) {
      abrirDetalle(claveInicial, false);
    }
  }

  /* ---------- Lightbox de fotos ---------- */
  var lightbox = document.getElementById('lightbox');

  if (lightbox) {
    var marcoLightbox = lightbox.querySelector('.lightbox__marco');
    var pieLightbox = lightbox.querySelector('.lightbox__pie');
    var cerrarLightbox = lightbox.querySelector('.lightbox__cerrar');
    var focoLightbox = null;

    var abrirFoto = function (disparador) {
      var ruta = disparador.getAttribute('data-imagen');
      if (!ruta) return;

      focoLightbox = disparador;
      marcoLightbox.innerHTML = '';

      var img = document.createElement('img');
      img.src = ruta;
      img.alt = disparador.getAttribute('data-titulo') || '';
      marcoLightbox.appendChild(img);

      if (pieLightbox) pieLightbox.textContent = disparador.getAttribute('data-titulo') || '';

      lightbox.hidden = false;
      document.body.classList.add('sin-scroll');
      requestAnimationFrame(function () { lightbox.classList.add('visible'); });
      if (cerrarLightbox) cerrarLightbox.focus();
    };

    var cerrarFoto = function () {
      lightbox.classList.remove('visible');
      // Si hay un detalle abierto detrás, el scroll sigue bloqueado por él
      if (!detalle || detalle.hidden) document.body.classList.remove('sin-scroll');
      window.setTimeout(function () {
        lightbox.hidden = true;
        marcoLightbox.innerHTML = '';
        if (pieLightbox) pieLightbox.textContent = '';
      }, 300);
      if (focoLightbox) { focoLightbox.focus(); focoLightbox = null; }
    };

    document.addEventListener('click', function (e) {
      var disparador = e.target.closest('[data-imagen]');
      if (!disparador) return;
      e.preventDefault();
      abrirFoto(disparador);
    });

    if (cerrarLightbox) cerrarLightbox.addEventListener('click', cerrarFoto);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) cerrarFoto();
    });

    // El lightbox está por encima del detalle: se cierra él primero
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) {
        e.stopImmediatePropagation();
        cerrarFoto();
      }
    }, true);
  }

  /* ---------- Animaciones de entrada ---------- */
  var reveladores = document.querySelectorAll('.revelar');

  if (reveladores.length) {
    if (animacionReducida || !('IntersectionObserver' in window)) {
      reveladores.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
            observador.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      reveladores.forEach(function (el) { observador.observe(el); });
    }
  }

  /* ---------- Año del pie ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
