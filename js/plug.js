/* =========================================================
   plug.js — builds the ElecTrack smart plug out of plain DOM
   + CSS 3D transforms. No libraries.

   The plug is made of four parts stacked front-to-back:
     front  → front shell (outlet + status ring)
     pzem   → PZEM-004T v3 energy meter board
     esp    → ESP32 board
     back   → back shell (wall prongs)

   Rounded solid shapes are faked by stacking thin rounded
   "slices" along the Z axis.
   ========================================================= */
(function () {
  "use strict";

  function el(cls, parent) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  /* A rounded slab: w × h footprint, d deep, built from slices. */
  function slab(opts) {
    var part = el("p3 slab " + (opts.cls || ""));
    var n = Math.max(2, Math.round(opts.d / opts.step));
    for (var i = 0; i <= n; i++) {
      var s = el("slice", part);
      var z = -opts.d / 2 + (opts.d * i) / n;
      var t = i / n; // 0 back → 1 front
      s.style.cssText =
        "width:" + opts.w + "px;height:" + opts.h + "px;margin:" + -opts.h / 2 + "px 0 0 " + -opts.w / 2 + "px;" +
        "border-radius:" + opts.r + "px;transform:translateZ(" + z.toFixed(2) + "px);" +
        "--shade:" + (0.55 + 0.45 * t).toFixed(3);
    }
    // faces sit just outside the slice stack
    if (opts.front !== false) {
      var f = el("face face--front", part);
      f.style.cssText =
        "width:" + opts.w + "px;height:" + opts.h + "px;margin:" + -opts.h / 2 + "px 0 0 " + -opts.w / 2 + "px;" +
        "border-radius:" + opts.r + "px;transform:translateZ(" + (opts.d / 2 + 0.6) + "px)";
      part.front = f;
    }
    if (opts.back !== false) {
      var b = el("face face--back", part);
      b.style.cssText =
        "width:" + opts.w + "px;height:" + opts.h + "px;margin:" + -opts.h / 2 + "px 0 0 " + -opts.w / 2 + "px;" +
        "border-radius:" + opts.r + "px;transform:translateZ(" + (-opts.d / 2 - 0.6) + "px) rotateY(180deg)";
      part.back = b;
    }
    return part;
  }

  /* A plain six-faced box, centred on its parent. */
  function box(w, h, d, cls, x, y, z) {
    var b = el("p3 box " + (cls || ""));
    b.style.transform = "translate3d(" + (x || 0) + "px," + (y || 0) + "px," + (z || 0) + "px)";
    var faces = [
      ["f", w, h, "translateZ(" + d / 2 + "px)"],
      ["k", w, h, "rotateY(180deg) translateZ(" + d / 2 + "px)"],
      ["r", d, h, "rotateY(90deg) translateZ(" + w / 2 + "px)"],
      ["l", d, h, "rotateY(-90deg) translateZ(" + w / 2 + "px)"],
      ["t", w, d, "rotateX(90deg) translateZ(" + h / 2 + "px)"],
      ["b", w, d, "rotateX(-90deg) translateZ(" + h / 2 + "px)"]
    ];
    faces.forEach(function (f) {
      var s = el("bf bf--" + f[0], b);
      s.style.cssText =
        "width:" + f[1] + "px;height:" + f[2] + "px;margin:" + -f[2] / 2 + "px 0 0 " + -f[1] / 2 + "px;transform:" + f[3];
    });
    return b;
  }

  /* Stacked discs → a short cylinder (capacitors, coil). */
  function cylinder(r, d, cls, x, y, z, ring) {
    var c = el("p3 cyl " + (cls || ""));
    c.style.transform = "translate3d(" + x + "px," + y + "px," + z + "px)";
    var n = Math.max(3, Math.round(d / 1.5));
    for (var i = 0; i <= n; i++) {
      var s = el("disc" + (ring ? " disc--ring" : ""), c);
      s.style.cssText =
        "width:" + r * 2 + "px;height:" + r * 2 + "px;margin:" + -r + "px 0 0 " + -r + "px;transform:translateZ(" + (d * i) / n + "px);" +
        "--shade:" + (0.6 + (0.4 * i) / n).toFixed(3);
    }
    return c;
  }

  function build(host) {
    var W = 168, H = 196, R = 38;

    var root = el("plug", host);
    var spin = el("plug__spin", root);

    /* ---------- front shell ---------- */
    var front = slab({ w: W, h: H, d: 40, r: R, step: 2.5, cls: "part part--front", back: false });
    var face = front.front;
    face.innerHTML =
      '<div class="outlet">' +
      '  <span class="slot slot--l"></span><span class="slot slot--r"></span>' +
      '  <span class="ground"></span>' +
      "</div>" +
      '<span class="status-ring" aria-hidden="true"><span></span></span>' +
      '<span class="wordmark">elec<b>track</b></span>';
    front.dataset.part = "front";

    /* ---------- PZEM-004T board ---------- */
    var pzem = slab({ w: 138, h: 160, d: 3, r: 8, step: 1.5, cls: "part part--pzem pcb pcb--green", back: false });
    pzem.dataset.part = "pzem";
    pzem.front.innerHTML =
      '<span class="silk silk--name">PZEM-004T v3.0</span>' +
      '<span class="trace t1"></span><span class="trace t2"></span><span class="trace t3"></span>' +
      '<span class="pad-row"></span>';
    var pzemParts = el("p3 comp", pzem);
    pzemParts.style.transform = "translateZ(2px)";
    pzemParts.appendChild(cylinder(26, 9, "coil", 18, -26, 0, true));          // current transformer coil
    pzemParts.appendChild(box(44, 16, 14, "terminal", -30, 56, 7));             // screw terminal block
    pzemParts.appendChild(box(20, 14, 4, "ic", -34, -40, 2));                 // metering IC
    pzemParts.appendChild(cylinder(6, 16, "cap", -40, 10, 0));                  // capacitor
    pzemParts.appendChild(cylinder(6, 12, "cap", -22, 10, 0));

    /* ---------- ESP32 board ---------- */
    var esp = slab({ w: 112, h: 146, d: 3, r: 6, step: 1.5, cls: "part part--esp pcb pcb--black", back: false });
    esp.dataset.part = "esp";
    esp.front.innerHTML =
      '<span class="antenna"></span>' +
      '<span class="silk silk--name">ESP32-WROOM-32</span>' +
      '<span class="pins pins--l"></span><span class="pins pins--r"></span>' +
      '<span class="led-dot"></span>';
    var espParts = el("p3 comp", esp);
    espParts.style.transform = "translateZ(2px)";
    espParts.appendChild(box(58, 48, 5, "shield", 0, -24, 2.5));               // metal RF shield can
    espParts.appendChild(box(14, 10, 6, "usb", 0, 66, 3));                      // micro USB
    espParts.appendChild(box(12, 12, 3, "ic ic--small", -24, 30, 1.5));    // UART bridge
    espParts.appendChild(box(10, 8, 4, "btn-sm", 26, 46, 2));                   // boot button

    /* ---------- back shell ---------- */
    var back = slab({ w: W, h: H, d: 40, r: R, step: 2.5, cls: "part part--back", front: false });
    back.dataset.part = "back";
    back.back.innerHTML = '<span class="label-plate">230V~ 60Hz 10A<br>Made in Cebu</span>';
    var prongs = el("p3 prongs", back);
    prongs.style.transform = "translateZ(-20px)";
    prongs.appendChild(box(4, 18, 26, "prong", -16, -14, -13));
    prongs.appendChild(box(4, 18, 26, "prong", 16, -14, -13));

    [front, pzem, esp, back].forEach(function (p) { spin.appendChild(p); });

    /* where each part sits when assembled vs exploded (z, y offsets) */
    var layout = {
      front: { z: 34, ez: 230, ey: -10 },
      pzem: { z: 4, ez: 90, ey: 0 },
      esp: { z: -16, ez: -40, ey: 0 },
      back: { z: -34, ez: -190, ey: 10 }
    };
    var parts = { front: front, pzem: pzem, esp: esp, back: back };

    var api = {
      root: root,
      spin: spin,
      parts: parts,
      rx: -14, ry: -32, scale: 1,
      explode: 0,
      setRotation: function (rx, ry) {
        api.rx = rx; api.ry = ry;
        spin.style.transform = "scale3d(" + api.scale + "," + api.scale + "," + api.scale + ") rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      },
      setScale: function (s) { api.scale = s; api.setRotation(api.rx, api.ry); },
      setExplode: function (t) {
        api.explode = t;
        Object.keys(parts).forEach(function (k) {
          var L = layout[k];
          var z = L.z + (L.ez - L.z) * t;
          var y = L.ey * t;
          parts[k].style.transform = "translate3d(0," + y + "px," + z + "px)";
        });
        root.style.setProperty("--explode", t.toFixed(3));
      },
      setFocus: function (name) {
        Object.keys(parts).forEach(function (k) {
          parts[k].classList.toggle("is-focus", k === name);
          parts[k].classList.toggle("is-dim", !!name && k !== name);
        });
      },
      setOn: function (on) { root.classList.toggle("is-on", !!on); }
    };
    api.setRotation(api.rx, api.ry);
    api.setExplode(0);
    return api;
  }

  window.SmartPlug = { build: build };
})();
