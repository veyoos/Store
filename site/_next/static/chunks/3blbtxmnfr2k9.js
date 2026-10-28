(() => {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 27475, t => {
        let e, i, n;
        var r = t.i(43476),
            s = t.i(71645);
        let o = ["transformPerspective", "x", "y", "z", "translateX", "translateY", "translateZ", "scale", "scaleX", "scaleY", "scaleZ", "rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"],
            a = new Set([...o, "pathRotation"]),
            l = (t, e, i) => i > e ? e : i < t ? t : i,
            u = {
                test: t => "number" == typeof t,
                parse: parseFloat,
                transform: t => t
            },
            h = { ...u,
                transform: t => l(0, 1, t)
            },
            d = { ...u,
                default: 1
            },
            c = t => Math.round(1e5 * t) / 1e5,
            p = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu,
            m = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,
            f = (t, e) => i => !!("string" == typeof i && m.test(i) && i.startsWith(t) || e && null != i && Object.prototype.hasOwnProperty.call(i, e)),
            g = (t, e, i) => n => {
                if ("string" != typeof n) return n;
                let [r, s, o, a] = n.match(p);
                return {
                    [t]: parseFloat(r),
                    [e]: parseFloat(s),
                    [i]: parseFloat(o),
                    alpha: void 0 !== a ? parseFloat(a) : 1
                }
            },
            y = { ...u,
                transform: t => Math.round(l(0, 255, t))
            },
            v = {
                test: f("rgb", "red"),
                parse: g("red", "green", "blue"),
                transform: ({
                    red: t,
                    green: e,
                    blue: i,
                    alpha: n = 1
                }) => "rgba(" + y.transform(t) + ", " + y.transform(e) + ", " + y.transform(i) + ", " + c(h.transform(n)) + ")"
            },
            x = {
                test: f("#"),
                parse: function(t) {
                    let e = "",
                        i = "",
                        n = "",
                        r = "";
                    return t.length > 5 ? (e = t.substring(1, 3), i = t.substring(3, 5), n = t.substring(5, 7), r = t.substring(7, 9)) : (e = t.substring(1, 2), i = t.substring(2, 3), n = t.substring(3, 4), r = t.substring(4, 5), e += e, i += i, n += n, r += r), {
                        red: parseInt(e, 16),
                        green: parseInt(i, 16),
                        blue: parseInt(n, 16),
                        alpha: r ? parseInt(r, 16) / 255 : 1
                    }
                },
                transform: v.transform
            },
            w = t => ({
                test: e => "string" == typeof e && e.endsWith(t) && 1 === e.split(" ").length,
                parse: parseFloat,
                transform: e => `${e}${t}`
            }),
            b = w("deg"),
            T = w("%"),
            k = w("px"),
            S = w("vh"),
            A = w("vw"),
            P = { ...T,
                parse: t => T.parse(t) / 100,
                transform: t => T.transform(100 * t)
            },
            M = {
                test: f("hsl", "hue"),
                parse: g("hue", "saturation", "lightness"),
                transform: ({
                    hue: t,
                    saturation: e,
                    lightness: i,
                    alpha: n = 1
                }) => "hsla(" + Math.round(t) + ", " + T.transform(c(e)) + ", " + T.transform(c(i)) + ", " + c(h.transform(n)) + ")"
            },
            C = {
                test: t => v.test(t) || x.test(t) || M.test(t),
                parse: t => v.test(t) ? v.parse(t) : M.test(t) ? M.parse(t) : x.parse(t),
                transform: t => "string" == typeof t ? t : t.hasOwnProperty("red") ? v.transform(t) : M.transform(t),
                getAnimatableNone: t => {
                    let e = C.parse(t);
                    return e.alpha = 0, C.transform(e)
                }
            },
            E = new RegExp(p.source),
            Y = RegExp(/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu.source, "i"),
            j = "number",
            V = "color",
            I = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)(?![a-z]*\()/giu;

        function R(t) {
            let e = t.toString(),
                i = [],
                n = {
                    color: [],
                    number: [],
                    var: []
                },
                r = [],
                s = 0,
                o = e.replace(I, t => (C.test(t) ? (n.color.push(s), r.push(V), i.push(C.parse(t))) : t.startsWith("var(") ? (n.var.push(s), r.push("var"), i.push(t)) : (n.number.push(s), r.push(j), i.push(parseFloat(t))), ++s, "${}")).split("${}");
            return {
                values: i,
                split: o,
                indexes: n,
                types: r
            }
        }

        function X({
            split: t,
            types: e
        }) {
            let i = t.length;
            return n => {
                let r = "";
                for (let s = 0; s < i; s++)
                    if (r += t[s], void 0 !== n[s]) {
                        let t = e[s];
                        t === j ? r += c(n[s]) : t === V ? r += C.transform(n[s]) : r += n[s]
                    }
                return r
            }
        }
        let D = {
                test: function(t) {
                    return isNaN(t) && "string" == typeof t && (E.test(t) || Y.test(t))
                },
                parse: function(t) {
                    return R(t).values
                },
                createTransformer: function(t) {
                    return X(R(t))
                },
                getAnimatableNone: function(t) {
                    let e = R(t);
                    return X(e)(e.values.map((t, i) => ((t, e) => "number" == typeof t ? e ?.trim().endsWith("/") ? t : 0 : "number" == typeof t ? 0 : C.test(t) ? C.getAnimatableNone(t) : t)(t, e.split[i])))
                }
            },
            B = new Set(["brightness", "contrast", "saturate", "opacity"]);

        function L(t) {
            let [e, i] = t.slice(0, -1).split("(");
            if ("drop-shadow" === e) return t;
            let [n] = i.match(p) || [];
            if (!n) return t;
            let r = i.replace(n, ""),
                s = +!!B.has(e);
            return n !== i && (s *= 100), e + "(" + s + r + ")"
        }
        let O = /\b([a-z-]*)\(.*?\)/gu,
            $ = { ...D,
                getAnimatableNone: t => {
                    let e = t.match(O);
                    return e ? e.map(L).join(" ") : t
                }
            },
            F = { ...D,
                getAnimatableNone: t => {
                    let e = D.parse(t);
                    return D.createTransformer(t)(e.map(t => "number" == typeof t ? 0 : "object" == typeof t ? { ...t,
                        alpha: 1
                    } : t))
                }
            },
            N = { ...u,
                transform: Math.round
            },
            _ = {
                rotate: b,
                pathRotation: b,
                rotateX: b,
                rotateY: b,
                rotateZ: b,
                scale: d,
                scaleX: d,
                scaleY: d,
                scaleZ: d,
                skew: b,
                skewX: b,
                skewY: b,
                distance: k,
                translateX: k,
                translateY: k,
                translateZ: k,
                x: k,
                y: k,
                z: k,
                perspective: k,
                transformPerspective: k,
                opacity: h,
                originX: P,
                originY: P,
                originZ: k
            },
            U = {
                borderWidth: k,
                borderTopWidth: k,
                borderRightWidth: k,
                borderBottomWidth: k,
                borderLeftWidth: k,
                borderRadius: k,
                borderTopLeftRadius: k,
                borderTopRightRadius: k,
                borderBottomRightRadius: k,
                borderBottomLeftRadius: k,
                width: k,
                maxWidth: k,
                height: k,
                maxHeight: k,
                top: k,
                right: k,
                bottom: k,
                left: k,
                inset: k,
                insetBlock: k,
                insetBlockStart: k,
                insetBlockEnd: k,
                insetInline: k,
                insetInlineStart: k,
                insetInlineEnd: k,
                padding: k,
                paddingTop: k,
                paddingRight: k,
                paddingBottom: k,
                paddingLeft: k,
                paddingBlock: k,
                paddingBlockStart: k,
                paddingBlockEnd: k,
                paddingInline: k,
                paddingInlineStart: k,
                paddingInlineEnd: k,
                margin: k,
                marginTop: k,
                marginRight: k,
                marginBottom: k,
                marginLeft: k,
                marginBlock: k,
                marginBlockStart: k,
                marginBlockEnd: k,
                marginInline: k,
                marginInlineStart: k,
                marginInlineEnd: k,
                fontSize: k,
                backgroundPositionX: k,
                backgroundPositionY: k,
                ..._,
                zIndex: N,
                fillOpacity: h,
                strokeOpacity: h,
                numOctaves: N
            },
            W = { ...U,
                color: C,
                backgroundColor: C,
                outlineColor: C,
                fill: C,
                stroke: C,
                borderColor: C,
                borderTopColor: C,
                borderRightColor: C,
                borderBottomColor: C,
                borderLeftColor: C,
                filter: $,
                WebkitFilter: $,
                mask: F,
                WebkitMask: F
            },
            z = t => W[t],
            H = () => ({
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0
            }),
            q = () => ({
                x: H(),
                y: H()
            }),
            G = () => ({
                min: 0,
                max: 0
            }),
            K = () => ({
                x: G(),
                y: G()
            }),
            Z = t => !!(t && t.getVelocity),
            J = new Set(["width", "height", "top", "left", "right", "bottom", ...o]),
            Q = [u, k, T, b, A, S, {
                test: t => "auto" === t,
                parse: t => t
            }],
            tt = t => Q.find(e => e.test(t)),
            te = () => {},
            ti = () => {},
            tn = t => e => "string" == typeof e && e.startsWith(t),
            tr = tn("--"),
            ts = tn("var(--"),
            to = t => !!ts(t) && ta.test(t.split("/*")[0].trim()),
            ta = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;

        function tl(t) {
            return "string" == typeof t && t.split("/*")[0].includes("var(--")
        }
        let tu = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u,
            th = new Set([$, F]);

        function td(t, e) {
            let i = z(t);
            return th.has(i) || (i = D), i.getAnimatableNone ? i.getAnimatableNone(e) : void 0
        }
        let tc = t => 180 * t / Math.PI,
            tp = t => tf(tc(Math.atan2(t[1], t[0]))),
            tm = {
                x: 4,
                y: 5,
                translateX: 4,
                translateY: 5,
                scaleX: 0,
                scaleY: 3,
                scaleZ: () => 1,
                scale: t => (Math.abs(t[0]) + Math.abs(t[3])) / 2,
                rotate: tp,
                rotateZ: tp,
                skewX: t => tc(Math.atan(t[1])),
                skewY: t => tc(Math.atan(t[2])),
                skew: t => (Math.abs(t[1]) + Math.abs(t[2])) / 2
            },
            tf = t => ((t %= 360) < 0 && (t += 360), t),
            tg = t => Math.hypot(t[0], t[1]),
            ty = t => Math.hypot(t[4], t[5]),
            tv = {
                x: 12,
                y: 13,
                z: 14,
                translateX: 12,
                translateY: 13,
                translateZ: 14,
                scaleX: tg,
                scaleY: ty,
                scaleZ: t => Math.hypot(t[8], t[9], t[10]),
                scale: t => (tg(t) + ty(t)) / 2,
                rotateX: t => tf(tc(Math.atan2(t[6], t[5]))),
                rotateY: t => tf(tc(Math.atan2(-t[2], t[0]))),
                rotateZ: tp,
                rotate: tp,
                skewX: t => tc(Math.atan(t[4])),
                skewY: t => tc(Math.atan(t[1])),
                skew: t => (Math.abs(t[1]) + Math.abs(t[4])) / 2
            };

        function tx(t) {
            return +!!t.includes("scale")
        }

        function tw(t, e) {
            let i, n;
            if (!t || "none" === t) return tx(e);
            let r = t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
            if (r) i = tv, n = r;
            else {
                let e = t.match(/^matrix\(([-\d.e\s,]+)\)$/u);
                i = tm, n = e
            }
            if (!n) return tx(e);
            let s = i[e],
                o = n[1].split(",").map(tT);
            return "function" == typeof s ? s(o) : o[s]
        }
        let tb = (t, e) => {
            let {
                transform: i = "none"
            } = getComputedStyle(t);
            return tw(i, e)
        };

        function tT(t) {
            return parseFloat(t.trim())
        }
        let tk = t => t === u || t === k,
            tS = new Set(["x", "y", "z"]),
            tA = o.filter(t => !tS.has(t)),
            tP = new Set(["bottom", "right"]);

        function tM(t, e, i, n, r, s) {
            let o = parseFloat(t);
            if (!isNaN(o)) return o;
            let {
                min: a,
                max: l
            } = e()[i], u = l - a;
            return "border-box" === s ? u : u - parseFloat(n) - parseFloat(r)
        }
        let tC = {
            width: ({
                width: t,
                paddingLeft: e = "0",
                paddingRight: i = "0",
                boxSizing: n
            }, r) => tM(t, r, "x", e, i, n),
            height: ({
                height: t,
                paddingTop: e = "0",
                paddingBottom: i = "0",
                boxSizing: n
            }, r) => tM(t, r, "y", e, i, n),
            top: ({
                top: t
            }) => parseFloat(t),
            left: ({
                left: t
            }) => parseFloat(t),
            bottom: ({
                top: t
            }, e) => {
                let {
                    y: i
                } = e();
                return parseFloat(t) + (i.max - i.min)
            },
            right: ({
                left: t
            }, e) => {
                let {
                    x: i
                } = e();
                return parseFloat(t) + (i.max - i.min)
            },
            x: ({
                transform: t
            }) => tw(t, "x"),
            y: ({
                transform: t
            }) => tw(t, "y")
        };
        tC.translateX = tC.x, tC.translateY = tC.y;
        let tE = t => t,
            tY = {},
            tj = ["setup", "read", "resolveKeyframes", "preUpdate", "update", "preRender", "render", "postRender"];

        function tV(t, e, i = {
            delta: 0,
            timestamp: 0,
            isProcessing: !1
        }) {
            let n = !1,
                r = !0,
                s = () => n = !0,
                o = tj.reduce((t, e) => (t[e] = function(t) {
                    let e = new Set,
                        i = new Set,
                        n = !1,
                        r = !1,
                        s = new Set,
                        o = {
                            delta: 0,
                            timestamp: 0,
                            isProcessing: !1
                        };

                    function a(e) {
                        s.has(e) && (i.add(e), t()), e(o)
                    }
                    let l = {
                        schedule: (t, r = !1, o = !1) => {
                            let a = o && n ? e : i;
                            return r && s.add(t), a.add(t), t
                        },
                        cancel: t => {
                            i.delete(t), s.delete(t)
                        },
                        process: t => {
                            if (o = t, n) {
                                r = !0;
                                return
                            }
                            n = !0;
                            let s = e;
                            e = i, i = s, e.forEach(a), e.clear(), n = !1, r && (r = !1, l.process(t))
                        }
                    };
                    return l
                }(s), t), {}),
                {
                    setup: a,
                    read: l,
                    resolveKeyframes: u,
                    preUpdate: h,
                    update: d,
                    preRender: c,
                    render: p,
                    postRender: m
                } = o,
                f = () => {
                    let s = tY.useManualTiming,
                        o = s ? i.timestamp : performance.now();
                    n = !1, s || (i.delta = r ? 1e3 / 60 : Math.max(Math.min(o - i.timestamp, 40), 1)), i.timestamp = o, i.isProcessing = !0, a.process(i), l.process(i), u.process(i), h.process(i), d.process(i), c.process(i), p.process(i), m.process(i), i.isProcessing = !1, n && e && (r = !1, t(f))
                };
            return {
                schedule: tj.reduce((e, s) => {
                    let a = o[s];
                    return e[s] = (e, s = !1, o = !1) => (!n && (n = !0, r = !0, i.isProcessing || t(f)), a.schedule(e, s, o)), e
                }, {}),
                cancel: t => {
                    for (let e = 0; e < tj.length; e++) o[tj[e]].cancel(t)
                },
                state: i,
                steps: o
            }
        }
        let tI = {
                delta: 0,
                timestamp: 0,
                isProcessing: !1
            },
            {
                schedule: tR,
                cancel: tX,
                steps: tD
            } = tV("u" > typeof requestAnimationFrame ? requestAnimationFrame : tE, !0, tI),
            tB = new Set,
            tL = !1,
            tO = !1,
            t$ = !1;

        function tF() {
            if (tO) {
                let t = [],
                    e = new Set,
                    i = new Set;
                tB.forEach(n => {
                    n.needsMeasurement && (t.push(n), e.add(n.element), tP.has(n.name) && i.add(n.element))
                });
                let n = new Map;
                i.forEach(t => {
                    let e, i = (e = [], tA.forEach(i => {
                        let n = t.getValue(i);
                        if (void 0 !== n) {
                            let t = n.get(),
                                r = +!!i.startsWith("scale");
                            if (t === r) return;
                            e.push([i, t]), n.set(r)
                        }
                    }), e);
                    i.length && (n.set(t, i), t.render())
                }), t.forEach(t => t.measureInitialState()), e.forEach(t => {
                    t.render();
                    let e = n.get(t);
                    e && e.forEach(([e, i]) => {
                        t.getValue(e) ?.set(i)
                    })
                }), t.forEach(t => t.measureEndState()), t.forEach(t => {
                    void 0 !== t.suspendedScrollY && window.scrollTo(0, t.suspendedScrollY)
                })
            }
            tO = !1, tL = !1, tB.forEach(t => t.complete(t$)), tB.clear()
        }

        function tN() {
            tB.forEach(t => {
                t.readKeyframes(), t.needsMeasurement && (tO = !0)
            })
        }
        class t_ {
            constructor(t, e, i, n, r, s = !1) {
                this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...t], this.onComplete = e, this.name = i, this.motionValue = n, this.element = r, this.isAsync = s
            }
            scheduleResolve() {
                this.state = "scheduled", this.isAsync ? (tB.add(this), tL || (tL = !0, tR.read(tN), tR.resolveKeyframes(tF))) : (this.readKeyframes(), this.complete())
            }
            readKeyframes() {
                let {
                    unresolvedKeyframes: t,
                    name: e,
                    element: i,
                    motionValue: n
                } = this;
                if (null === t[0]) {
                    let r = n ?.get(),
                        s = t[t.length - 1];
                    if (void 0 !== r) t[0] = r;
                    else if (i && e) {
                        let n = function(t, e, i) {
                            if ("string" == typeof t) {
                                if (/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t) || /^0[^.\s]+$/u.test(t)) return parseFloat(t);
                                if (!D.test(t) && D.test(i)) return td(e, i)
                            }
                            return t ?? void 0
                        }(i.readValue(e, s), e, s);
                        void 0 !== n && (t[0] = n)
                    }
                    void 0 === t[0] && (t[0] = s), n && void 0 === r && n.set(t[0])
                }
                for (let e = 1; e < t.length; e++) t[e] ?? (t[e] = t[e - 1])
            }
            setFinalKeyframe() {}
            measureInitialState() {}
            renderEndStyles() {}
            measureEndState() {}
            complete(t = !1) {
                this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, t), tB.delete(this)
            }
            cancel() {
                "scheduled" === this.state && (tB.delete(this), this.state = "pending")
            }
            resume() {
                "pending" === this.state && this.scheduleResolve()
            }
        }
        let tU = new Set(["auto", "none", "0"]);
        class tW extends t_ {
            constructor(t, e, i, n, r) {
                super(t, e, i, n, r, !0)
            }
            scheduleResolve() {
                if (this.canReadNow() && (this.readKeyframes(), !this.needsMeasurement)) return this.complete();
                super.scheduleResolve()
            }
            canReadNow() {
                let {
                    unresolvedKeyframes: t,
                    element: e,
                    motionValue: i
                } = this, n = t[0] ?? i ?.get();
                if (!e ?.current || void 0 === n) return !1;
                for (let e = 0; e < t.length; e++)
                    if (tl(e ? t[e] : n)) return !1;
                return !0
            }
            readKeyframes() {
                let {
                    unresolvedKeyframes: t,
                    element: e,
                    name: i
                } = this;
                if (!e || !e.current) return;
                super.readKeyframes();
                for (let i = 0; i < t.length; i++) {
                    let n = t[i];
                    if ("string" == typeof n && to(n = n.trim())) {
                        let r = function t(e, i, n = 1) {
                            ti(`Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`);
                            let [r, s] = function(t) {
                                let e = tu.exec(t);
                                if (!e) return [, ];
                                let [, i, n, r] = e;
                                return [`--${i??n}`, r]
                            }(e);
                            if (!r) return;
                            let o = window.getComputedStyle(i).getPropertyValue(r);
                            if (o) {
                                let t = o.trim();
                                return /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t) ? parseFloat(t) : t
                            }
                            return to(s) ? t(s, i, n + 1) : s
                        }(n, e.current);
                        void 0 !== r && (t[i] = r), i === t.length - 1 && (this.finalKeyframe = n)
                    }
                }
                if (this.resolveNoneKeyframes(), !J.has(i) || 2 !== t.length) return;
                let [n, r] = t;
                if ("number" == typeof n && "number" == typeof r) return;
                let s = tt(n),
                    o = tt(r);
                if (tl(n) !== tl(r) && tC[i]) {
                    this.needsMeasurement = !0;
                    return
                }
                if (s !== o)
                    if (tk(s) && tk(o))
                        for (let e = 0; e < t.length; e++) {
                            let i = t[e];
                            "string" == typeof i && (t[e] = parseFloat(i))
                        } else tC[i] && (this.needsMeasurement = !0)
            }
            resolveNoneKeyframes() {
                let {
                    unresolvedKeyframes: t,
                    name: e
                } = this, i = [];
                for (let e = 0; e < t.length; e++)(null === t[e] || function(t) {
                    if ("number" == typeof t) return 0 === t;
                    if (null === t) return !0;
                    return "none" === t || "0" === t || /^0[^.\s]+$/u.test(t)
                }(t[e])) && i.push(e);
                i.length && function(t, e, i) {
                    let n, r = 0;
                    for (; r < t.length && !n;) {
                        let e = t[r];
                        "string" == typeof e && !tU.has(e) && function(t) {
                            let e = t.toString();
                            return E.test(e) || Y.test(e)
                        }(e) && (n = t[r]), r++
                    }
                    if (n && i)
                        for (let r of e) t[r] !== n && (t[r] = td(i, n))
                }(t, i, e)
            }
            measure() {
                let {
                    element: t,
                    name: e
                } = this;
                return tC[e](window.getComputedStyle(t.current), () => t.measureViewportBox())
            }
            measureInitialState() {
                let {
                    element: t,
                    unresolvedKeyframes: e,
                    name: i
                } = this;
                if (!t || !t.current) return;
                "height" === i && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = this.measure(), e[0] = this.measuredOrigin;
                let n = e[e.length - 1];
                void 0 !== n && this.motionValue ?.jump(n, !1)
            }
            measureEndState() {
                let {
                    element: t,
                    unresolvedKeyframes: e
                } = this;
                if (!t || !t.current) return;
                this.motionValue ?.jump(this.measuredOrigin, !1);
                let i = e.length - 1,
                    n = e[i];
                e[i] = this.measure(), null !== n && void 0 === this.finalKeyframe && (this.finalKeyframe = n), this.removedTransforms ?.length && this.removedTransforms.forEach(([e, i]) => {
                    t.getValue(e).set(i)
                }), this.resolveNoneKeyframes()
            }
        }
        let tz = t => 1e3 * t;

        function tH(t, e) {
            -1 === t.indexOf(e) && t.push(e)
        }

        function tq(t, e) {
            let i = t.indexOf(e);
            i > -1 && t.splice(i, 1)
        }
        class tG {
            constructor() {
                this.subscriptions = []
            }
            add(t) {
                return tH(this.subscriptions, t), () => this.remove(t)
            }
            remove(t) {
                tq(this.subscriptions, t)
            }
            notify(t, e, i) {
                let n = this.subscriptions.length;
                if (n)
                    if (1 === n) this.subscriptions[0](t, e, i);
                    else
                        for (let r = 0; r < n; r++) {
                            let n = this.subscriptions[r];
                            n && n(t, e, i)
                        }
            }
            getSize() {
                return this.subscriptions.length
            }
            clear() {
                this.subscriptions.length = 0
            }
        }

        function tK(t, e, i) {
            e.startsWith("--") ? t.style.setProperty(e, i) : t.style[e] = i
        }

        function tZ(t) {
            let e;
            return () => (void 0 === e && (e = t()), e)
        }
        let tJ = {};

        function tQ(t, e) {
            let i = tZ(t);
            return () => tJ[e] ?? i()
        }
        let t0 = tQ(() => void 0 !== window.ScrollTimeline, "scrollTimeline"),
            t1 = t => null !== t;

        function t5(t, {
            repeat: e,
            repeatType: i = "loop"
        }, n, r = 1) {
            let s = t.filter(t1),
                o = r < 0 || e && "loop" !== i && e % 2 == 1 ? 0 : s.length - 1;
            return o && void 0 !== n ? n : s[o]
        }
        class t3 {
            constructor() {
                this.isResolved = !1
            }
            get finished() {
                return this._finished || (this._finished = this.isResolved ? Promise.resolve() : new Promise(t => {
                    this._resolve = t
                })), this._finished
            }
            updateFinished() {
                this._finished = this._resolve = void 0, this.isResolved = !1
            }
            notifyFinished() {
                this.isResolved = !0, this._resolve ?.()
            }
            then(t, e) {
                return this.finished.then(t, e)
            }
        }

        function t2() {
            e = void 0
        }
        let t4 = {
            now: () => (void 0 === e && t4.set(tI.isProcessing || tY.useManualTiming ? tI.timestamp : performance.now()), e),
            set: t => {
                e = t, queueMicrotask(t2)
            }
        };

        function t8(t, e) {
            return {
                kind: t,
                animation: e,
                timestamp: t4.now(),
                frameTimestamp: tI.timestamp,
                frameIsProcessing: tI.isProcessing
            }
        }

        function t6(t, e, i) {
            let n = globalThis.__MOTION_INSPECT__;
            if (n) try {
                n({ ...t8("animation-start", t),
                    options: i ? { ...e,
                        ...i
                    } : e
                })
            } catch {}
        }
        let t9 = t => Array.isArray(t) && "number" == typeof t[0],
            t7 = tQ(() => {
                try {
                    document.createElement("div").animate({
                        opacity: 0
                    }, {
                        easing: "linear(0, 1)"
                    })
                } catch (t) {
                    return !1
                }
                return !0
            }, "linearEasing"),
            et = (t, e, i = 10) => {
                let n = "",
                    r = Math.max(Math.round(e / i), 2);
                for (let e = 0; e < r; e++) n += Math.round(1e4 * t(e / (r - 1))) / 1e4 + ", ";
                return `linear(${n.substring(0,n.length-2)})`
            },
            ee = ([t, e, i, n]) => `cubic-bezier(${t}, ${e}, ${i}, ${n})`,
            ei = {
                linear: "linear",
                ease: "ease",
                easeIn: "ease-in",
                easeOut: "ease-out",
                easeInOut: "ease-in-out",
                circIn: ee([0, .65, .55, 1]),
                circOut: ee([.55, 0, 1, .45]),
                backIn: ee([.31, .01, .66, -.59]),
                backOut: ee([.33, 1.53, .69, .99])
            };

        function en(t) {
            return "function" == typeof t && "applyToOptions" in t
        }
        class er extends t3 {
            constructor(t) {
                if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !t) return;
                let {
                    element: e,
                    name: i,
                    keyframes: n,
                    pseudoElement: r,
                    allowFlatten: s = !1,
                    finalKeyframe: o,
                    onComplete: a
                } = t;
                this.isPseudoElement = !!r, this.allowFlatten = s, this.options = t, ti(t.type);
                let l = function({
                    type: t,
                    ...e
                }) {
                    return en(t) && t7() ? t.applyToOptions(e) : (e.duration ?? (e.duration = 300), e.ease ?? (e.ease = "easeOut"), e)
                }(t);
                this.animation = function(t, e, i, {
                    delay: n = 0,
                    duration: r = 300,
                    repeat: s = 0,
                    repeatType: o = "loop",
                    ease: a = "easeOut",
                    times: l
                } = {}, u) {
                    let h = {
                        [e]: i
                    };
                    l && (h.offset = l);
                    let d = function t(e, i) {
                        if (e) return "function" == typeof e ? t7() ? et(e, i) : "ease-out" : t9(e) ? ee(e) : Array.isArray(e) ? e.map(e => t(e, i) || ei.easeOut) : ei[e]
                    }(a, r);
                    Array.isArray(d) && (h.easing = d);
                    let c = {
                        delay: n,
                        duration: r,
                        easing: Array.isArray(d) ? "linear" : d,
                        fill: "both",
                        iterations: s + 1,
                        direction: "reverse" === o ? "alternate" : "normal"
                    };
                    return u && (c.pseudoElement = u), t.animate(h, c)
                }(e, i, n, l, r), !1 === l.autoplay && this.animation.pause(), this.animation.onfinish = () => {
                    if (this.finishedTime = this.time, !r) {
                        let t = t5(n, this.options, o, this.speed);
                        this.updateMotionValue && this.updateMotionValue(t), tK(e, i, t), this.animation.cancel()
                    }
                    a ?.(), this.notifyFinished()
                }, t6(this, t, l)
            }
            play() {
                this.isStopped || (this.manualStartTime = null, this.animation.play(), "finished" === this.state && this.updateFinished())
            }
            pause() {
                this.animation.pause()
            }
            complete() {
                this.animation.finish ?.()
            }
            cancel() {
                try {
                    this.animation.cancel()
                } catch (t) {}
            }
            stop() {
                if (this.isStopped) return;
                this.isStopped = !0;
                let {
                    state: t
                } = this;
                "idle" !== t && "finished" !== t && (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel())
            }
            commitStyles() {
                let t = this.options ?.element;
                !this.isPseudoElement && t ?.isConnected && this.animation.commitStyles ?.()
            }
            get duration() {
                return Number(this.animation.effect ?.getComputedTiming ?.().duration || 0) / 1e3
            }
            get iterationDuration() {
                let {
                    delay: t = 0
                } = this.options || {};
                return this.duration + t / 1e3
            }
            get time() {
                return (Number(this.animation.currentTime) || 0) / 1e3
            }
            set time(t) {
                let e = null !== this.finishedTime;
                this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = tz(t), e && this.animation.pause()
            }
            get speed() {
                return this.animation.playbackRate
            }
            set speed(t) {
                t < 0 && (this.finishedTime = null), this.animation.playbackRate = t
            }
            get state() {
                return null !== this.finishedTime ? "finished" : this.animation.playState
            }
            get startTime() {
                return this.manualStartTime ?? Number(this.animation.startTime)
            }
            set startTime(t) {
                this.manualStartTime = this.animation.startTime = t
            }
            attachTimeline({
                timeline: t,
                onAttach: e,
                observe: i
            }) {
                return (this.allowFlatten && this.animation.effect ?.updateTiming({
                    easing: "linear"
                }), this.animation.onfinish = null, t && t0()) ? (this.animation.timeline = t, e ?.(this.animation), tE) : i(this)
            }
        }
        let es = new Set(["opacity", "clipPath", "filter", "transform", "backgroundColor"]),
            eo = new WeakMap,
            {
                schedule: ea
            } = tV(queueMicrotask, !1),
            el = (t, e) => e ? 1e3 / e * t : 0,
            eu = {
                current: void 0
            };
        class eh {
            constructor(t, e = {}) {
                this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = t => {
                    let e = t4.now();
                    if (this.updatedAt !== e && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(t), this.current !== this.prev && (this.notifyChange(), this.dependents))
                        for (let t of this.dependents) t.dirty()
                }, this.hasAnimated = !1, this.setCurrent(t), this.owner = e.owner
            }
            setCurrent(t) {
                this.current = t, this.updatedAt = t4.now(), null === this.canTrackVelocity && void 0 !== t && (this.canTrackVelocity = !isNaN(parseFloat(this.current)))
            }
            setPrevFrameValue(t = this.current) {
                this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt
            }
            onChange(t) {
                return this.on("change", t)
            }
            on(t, e) {
                var i;
                return "change" === t ? this.onChangeSubscribe(e) : ((i = this.events)[t] || (i[t] = new tG)).add(e)
            }
            onChangeSubscribe(t) {
                let {
                    events: e
                } = this;
                return e.change || this.changeSubscriber ? (e.change || (e.change = new tG, e.change.add(this.changeSubscriber), this.changeSubscriber = void 0), e.change.add(t)) : this.changeSubscriber = t, () => {
                    this.changeSubscriber === t ? this.changeSubscriber = void 0 : e.change ?.remove(t), this.stopIfUnobserved()
                }
            }
            stopIfUnobserved() {
                tR.read(() => {
                    this.changeSubscriber || this.events.change ?.getSize() || this.stop()
                })
            }
            clearListeners() {
                for (let t in this.changeSubscriber = void 0, this.events) this.events[t].clear()
            }
            attach(t, e) {
                this.passiveEffect = t, this.stopPassiveEffect = e
            }
            set(t) {
                this.passiveEffect ? this.passiveEffect(t, this.updateAndNotify) : this.updateAndNotify(t)
            }
            setWithVelocity(t, e, i) {
                this.set(e), this.prev = void 0, this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt - i
            }
            jump(t, e = !0) {
                this.updateAndNotify(t), this.prev = t, this.prevUpdatedAt = this.prevFrameValue = void 0, e && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect()
            }
            dirty() {
                this.notifyChange()
            }
            notifyChange() {
                let {
                    current: t,
                    changeSubscriber: e
                } = this;
                e ? e(t) : this.events.change ?.notify(t)
            }
            addDependent(t) {
                this.dependents || (this.dependents = new Set), this.dependents.add(t)
            }
            removeDependent(t) {
                this.dependents && this.dependents.delete(t)
            }
            get() {
                eu.current && eu.current.push(this);
                let t = this.animation ?.liveValue ?.();
                return void 0 === t ? this.current : t
            }
            getCurrent() {
                return this.current
            }
            getPrevious() {
                return this.prev
            }
            getVelocity() {
                let t = t4.now();
                if (!this.canTrackVelocity || void 0 === this.prevFrameValue || t - this.updatedAt > 30) return 0;
                let e = Math.min(this.updatedAt - this.prevUpdatedAt, 30);
                return el(parseFloat(this.current) - parseFloat(this.prevFrameValue), e)
            }
            start(t) {
                return this.stop(), new Promise(e => {
                    let i;
                    this.hasAnimated = !0;
                    let n = !1;
                    i = t(() => {
                        n = !0, this.events.animationComplete ?.notify(), this.animation === i && this.clearAnimation(), e()
                    }), n || (this.animation = i), this.events.animationStart ?.notify()
                })
            }
            stop() {
                this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation()
            }
            isAnimating() {
                return !!this.animation
            }
            clearAnimation() {
                this.animation = void 0
            }
            destroy() {
                this.dependents ?.clear(), this.events.destroy ?.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect()
            }
        }

        function ed(t, e) {
            return new eh(t, e)
        }
        let ec = new WeakMap;

        function ep(t) {
            return null !== t && "object" == typeof t && "function" == typeof t.start
        }

        function em(t) {
            return "string" == typeof t || Array.isArray(t)
        }
        let ef = ["animate", "whileInView", "whileFocus", "whileHover", "whileTap", "whileDrag", "exit"],
            eg = ["initial", ...ef];

        function ey(t) {
            if (ep(t.animate)) return !0;
            for (let e = 0; e < eg.length; e++)
                if (em(t[eg[e]])) return !0;
            return !1
        }

        function ev(t) {
            return !!(ey(t) || t.variants)
        }
        let ex = {
                current: null
            },
            ew = {
                current: !1
            },
            eb = "u" > typeof window;

        function eT() {
            if (ew.current = !0, eb)
                if (window.matchMedia) {
                    let t = window.matchMedia("(prefers-reduced-motion)"),
                        e = () => ex.current = t.matches;
                    t.addEventListener("change", e), e()
                } else ex.current = !1
        }
        let ek = ["AnimationStart", "AnimationComplete", "Update", "BeforeLayoutMeasure", "LayoutMeasure", "LayoutAnimationStart", "LayoutAnimationComplete"],
            eS = {};
        class eA {
            scrapeMotionValuesFromProps(t, e, i) {
                return {}
            }
            constructor({
                parent: t,
                props: e,
                presenceContext: i,
                reducedMotionConfig: n,
                skipAnimations: r,
                blockInitialAnimation: s,
                visualState: o
            }, a = {}) {
                this.current = null, this.children = new Set, this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = new Map, this.KeyframeResolver = t_, this.features = {}, this.valueSubscriptions = new Map, this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
                    this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection))
                }, this.renderScheduledAt = 0, this.scheduleRender = () => {
                    let t = t4.now();
                    this.renderScheduledAt < t && (this.renderScheduledAt = t, tR.render(this.render, !1, !0))
                };
                let {
                    latestValues: l,
                    renderState: u
                } = o;
                this.latestValues = l, this.baseTarget = { ...l
                }, this.initialValues = e.initial ? { ...l
                } : {}, this.renderState = u, this.parent = t, this.props = e, this.presenceContext = i, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = n, this.skipAnimationsConfig = r, this.options = a, this.blockInitialAnimation = !!s, this.isControllingVariants = ey(e), this.isVariantNode = ev(e), this.isVariantNode && (this.variantChildren = new Set), this.manuallyAnimateOnMount = !!(t && t.current);
                let {
                    willChange: h,
                    ...d
                } = this.scrapeMotionValuesFromProps(e, {}, this);
                for (let t in d) {
                    let e = d[t];
                    void 0 !== l[t] && Z(e) && e.set(l[t])
                }
            }
            mount(t) {
                if (this.hasBeenMounted)
                    for (let t in this.initialValues) this.values.get(t) ?.jump(this.initialValues[t]), this.latestValues[t] = this.initialValues[t];
                if (this.current = t, ec.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.isVariantNode && !this.isControllingVariants) {
                    let t = this;
                    do t = !1 !== t.props.inherit && t.parent; while (t && !t.isVariantNode) if (t) {
                        let {
                            variantChildren: e
                        } = t;
                        e.add(this), this.removeFromVariantTree = () => e.delete(this)
                    }
                }
                this.values.forEach((t, e) => this.bindToMotionValue(e, t)), "never" === this.reducedMotionConfig ? this.shouldReduceMotion = !1 : "always" === this.reducedMotionConfig ? this.shouldReduceMotion = !0 : (ew.current || eT(), this.shouldReduceMotion = ex.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent ?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0
            }
            unmount() {
                for (let t in this.projection && this.projection.unmount(), tX(this.notifyUpdate), tX(this.render), this.valueSubscriptions.forEach(t => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent ?.removeChild(this), this.events) this.events[t].clear();
                for (let t in this.features) {
                    let e = this.features[t];
                    e && (e.unmount(), e.isMounted = !1)
                }
                this.current = null
            }
            addChild(t) {
                this.children.add(t), this.enteringChildren ?? (this.enteringChildren = new Set), this.enteringChildren.add(t)
            }
            removeChild(t) {
                this.children.delete(t), this.enteringChildren && this.enteringChildren.delete(t)
            }
            bindToMotionValue(t, e) {
                let i;
                if (this.valueSubscriptions.has(t) && this.valueSubscriptions.get(t)(), e.accelerate && es.has(t) && this.current instanceof HTMLElement) {
                    let {
                        factory: i,
                        keyframes: n,
                        times: r,
                        ease: s,
                        duration: o
                    } = e.accelerate, a = new er({
                        element: this.current,
                        name: t,
                        keyframes: n,
                        times: r,
                        ease: s,
                        duration: tz(o)
                    }), l = i(a);
                    this.valueSubscriptions.set(t, () => {
                        l(), a.cancel()
                    });
                    return
                }
                let n = a.has(t);
                n && this.onBindTransform && this.onBindTransform();
                let r = e.on("change", e => {
                    this.latestValues[t] = e, this.props.onUpdate && tR.preRender(this.notifyUpdate), n && (this.projection && (this.projection.isTransformDirty = !0), eo.get(this.current) ?.check()), this.scheduleRender()
                });
                "u" > typeof window && window.MotionCheckAppearSync && (i = window.MotionCheckAppearSync(this, t, e)), this.valueSubscriptions.set(t, () => {
                    r(), i && i()
                })
            }
            sortNodePosition(t) {
                return this.current && t.current && this.sortInstanceNodePosition && this.type === t.type ? this.sortInstanceNodePosition(this.current, t.current) : 0
            }
            updateFeatures() {
                let t = "animation";
                for (t in eS) {
                    let e = eS[t];
                    if (!e) continue;
                    let {
                        isEnabled: i,
                        Feature: n
                    } = e;
                    if (!this.features[t] && n && i(this.props) && (this.features[t] = new n(this)), this.features[t]) {
                        let e = this.features[t];
                        e.isMounted ? e.update() : (e.mount(), e.isMounted = !0)
                    }
                }
            }
            triggerBuild() {
                this.build(this.renderState, this.latestValues, this.props)
            }
            measureViewportBox() {
                return this.current ? this.measureInstanceViewportBox(this.current, this.props) : K()
            }
            getStaticValue(t) {
                return this.latestValues[t]
            }
            setStaticValue(t, e) {
                this.latestValues[t] = e
            }
            update(t, e) {
                let {
                    transformTemplate: i,
                    onUpdate: n
                } = this.props;
                (t.transformTemplate || i) && this.scheduleRender(), (t.transformTemplate && !i || t.onUpdate && !n) && eo.get(this.current) ?.demote(), this.prevProps = this.props, this.props = t, this.prevPresenceContext = this.presenceContext, this.presenceContext = e;
                for (let e = 0; e < ek.length; e++) {
                    let i = ek[e];
                    this.propEventSubscriptions[i] && (this.propEventSubscriptions[i](), delete this.propEventSubscriptions[i]);
                    let n = t["on" + i];
                    n && (this.propEventSubscriptions[i] = this.on(i, n))
                }
                this.prevMotionValues = function(t, e, i) {
                    for (let n in e) {
                        let r = e[n],
                            s = i[n];
                        if (Z(r)) t.addValue(n, r);
                        else if (Z(s)) t.addValue(n, ed(r, {
                            owner: t
                        }));
                        else if (s !== r)
                            if (t.hasValue(n)) {
                                let e = t.getValue(n);
                                !0 === e.liveStyle ? e.jump(r) : e.hasAnimated || e.set(r)
                            } else {
                                let e = t.getStaticValue(n);
                                t.addValue(n, ed(void 0 !== e ? e : r, {
                                    owner: t
                                }))
                            }
                    }
                    for (let n in i) void 0 === e[n] && t.removeValue(n);
                    return e
                }(this, this.scrapeMotionValuesFromProps(t, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue()
            }
            getProps() {
                return this.props
            }
            getVariant(t) {
                return this.props.variants ? this.props.variants[t] : void 0
            }
            getDefaultTransition() {
                return this.props.transition
            }
            getTransformPagePoint() {
                return this.props.transformPagePoint
            }
            addValue(t, e) {
                let i = this.values.get(t);
                if (e !== i) {
                    i && this.removeValue(t), this.bindToMotionValue(t, e), this.values.set(t, e);
                    let n = e.get();
                    void 0 !== n && (this.latestValues[t] = n)
                }
            }
            removeValue(t) {
                this.values.delete(t);
                let e = this.valueSubscriptions.get(t);
                e && (e(), this.valueSubscriptions.delete(t)), delete this.latestValues[t], this.removeValueFromRenderState(t, this.renderState)
            }
            hasValue(t) {
                return this.values.has(t)
            }
            getValue(t, e) {
                if (this.props.values && this.props.values[t]) return this.props.values[t];
                let i = this.values.get(t);
                return void 0 === i && void 0 !== e && (i = ed(e ?? this.getDefaultValue ?.(t), {
                    owner: this
                }), this.addValue(t, i)), i
            }
            readValue(t, e) {
                let i = void 0 === this.latestValues[t] && this.current ? this.getBaseTargetFromProps(this.props, t) ?? this.readValueFromInstance(this.current, t, this.options) : this.latestValues[t];
                if (null != i) {
                    let n, r;
                    "string" == typeof i && (n = i, /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(n) || (r = i, /^0[^.\s]+$/u.test(r))) ? i = parseFloat(i) : "number" != typeof i && !D.test(i) && D.test(e) && (i = td(t, e)), this.setBaseTarget(t, Z(i) ? i.get() : i)
                }
                return Z(i) ? i.get() : i
            }
            setBaseTarget(t, e) {
                this.baseTarget[t] = e
            }
            on(t, e) {
                return this.events[t] || (this.events[t] = new tG), this.events[t].add(e)
            }
            notify(t, ...e) {
                this.events[t] && this.events[t].notify(...e)
            }
            scheduleRenderMicrotask() {
                ea.render(this.render)
            }
        }
        class eP extends eA {
            constructor() {
                super(...arguments), this.KeyframeResolver = tW
            }
            sortInstanceNodePosition(t, e) {
                return 2 & t.compareDocumentPosition(e) ? 1 : -1
            }
            getBaseTargetFromProps(t, e) {
                let i = t.style;
                return i ? i[e] : void 0
            }
            removeValueFromRenderState(t, {
                vars: e,
                style: i
            }) {
                delete e[t], delete i[t]
            }
            handleChildMotionValue() {
                this.childSubscription && (this.childSubscription(), delete this.childSubscription);
                let {
                    children: t
                } = this.props;
                Z(t) && (this.childSubscription = t.on("change", t => {
                    this.current && (this.current.textContent = `${t}`)
                }))
            }
        }

        function eM(t) {
            return t.replace(/([A-Z])/g, t => `-${t.toLowerCase()}`)
        }
        let eC = (t, e) => e && "number" == typeof t ? e.transform(t) : t,
            eE = {
                x: "translateX",
                y: "translateY",
                z: "translateZ",
                transformPerspective: "perspective"
            },
            eY = o.length;

        function ej(t, e, i) {
            let n = "",
                r = !0;
            for (let s = 0; s < eY; s++) {
                let a = o[s],
                    l = t[a];
                if (void 0 === l) continue;
                let u = !0;
                if ("number" == typeof l) u = l === +!!a.startsWith("scale");
                else {
                    let t = parseFloat(l);
                    u = a.startsWith("scale") ? 1 === t : 0 === t
                }
                if (!u || i) {
                    let t = eC(l, U[a]);
                    if (!u) {
                        r = !1;
                        let e = eE[a] || a;
                        n += `${e}(${t}) `
                    }
                    i && (e[a] = t)
                }
            }
            let s = t.pathRotation;
            return s && (r = !1, n += `rotate(${eC(s,U.pathRotation)}) `), n = n.trim(), i ? n = i(e, r ? "" : n) : r && (n = "none"), n
        }

        function eV(t, e, i) {
            let {
                style: n,
                vars: r,
                transformOrigin: s
            } = t, o = !1, l = !1;
            for (let t in e) {
                let i = e[t];
                if (a.has(t)) {
                    o = !0;
                    continue
                }
                if (tr(t)) {
                    r[t] = i;
                    continue
                } {
                    let e = eC(i, U[t]);
                    t.startsWith("origin") ? (l = !0, s[t] = e) : n[t] = e
                }
            }
            if (!e.transform && (o || i ? n.transform = ej(e, t.transform, i) : n.transform && (n.transform = "none")), l) {
                let {
                    originX: t = "50%",
                    originY: e = "50%",
                    originZ: i = 0
                } = s;
                n.transformOrigin = `${t} ${e} ${i}`
            }
        }
        let eI = {
                offset: "stroke-dashoffset",
                array: "stroke-dasharray"
            },
            eR = {
                offset: "strokeDashoffset",
                array: "strokeDasharray"
            },
            eX = ["transform", "opacity", "clipPath", "filter", "offsetDistance", "offsetPath", "offsetRotate", "offsetAnchor"];

        function eD(t, {
            attrX: e,
            attrY: i,
            attrScale: n,
            pathLength: r,
            pathSpacing: s = 1,
            pathOffset: o = 0,
            ...a
        }, l, u, h) {
            if (eV(t, a, u), l) {
                t.style.viewBox && (t.attrs.viewBox = t.style.viewBox);
                return
            }
            t.attrs = t.style, t.style = {};
            let {
                attrs: d,
                style: c
            } = t;
            for (let t of eX) void 0 !== d[t] && (c[t] = d[t], delete d[t]);
            (c.transform || d.transformOrigin) && (c.transformOrigin = d.transformOrigin ?? "50% 50%", delete d.transformOrigin), c.transform && (c.transformBox = h ?.transformBox ?? "fill-box", delete d.transformBox), void 0 !== e && (d.x = e), void 0 !== i && (d.y = i), void 0 !== n && (d.scale = n), void 0 !== r && function(t, e, i = 1, n = 0, r = !0) {
                t.pathLength = 1;
                let s = r ? eI : eR;
                t[s.offset] = `${-n}`, t[s.array] = `${e} ${i}`
            }(d, r, s, o, !1)
        }
        let eB = new Set(["baseFrequency", "diffuseConstant", "kernelMatrix", "kernelUnitLength", "keySplines", "keyTimes", "limitingConeAngle", "markerHeight", "markerWidth", "numOctaves", "targetX", "targetY", "surfaceScale", "specularConstant", "specularExponent", "stdDeviation", "tableValues", "viewBox", "gradientTransform", "pathLength", "startOffset", "textLength", "lengthAdjust"]),
            eL = t => "string" == typeof t && "svg" === t.toLowerCase();

        function eO(t, {
            style: e,
            vars: i
        }, n, r) {
            let s, o = t.style;
            for (s in e) o[s] = e[s];
            for (s in r ?.applyProjectionStyles(o, n), i) o.setProperty(s, i[s])
        }
        let e$ = {};

        function eF(t, {
            layout: e,
            layoutId: i
        }) {
            return a.has(t) || t.startsWith("origin") || (e || void 0 !== i) && (!!e$[t] || "opacity" === t)
        }

        function eN(t, e, i) {
            let n = t.style,
                r = e ?.style,
                s = {};
            if (!n) return s;
            for (let e in n)(Z(n[e]) || r && Z(r[e]) || eF(e, t) || i ?.getValue(e) ?.liveStyle !== void 0) && (s[e] = n[e]);
            return s
        }

        function e_(t, e, i) {
            let n = eN(t, e, i);
            for (let i in t) "children" !== i && (Z(t[i]) || Z(e[i])) && (n[-1 !== o.indexOf(i) ? "attr" + i.charAt(0).toUpperCase() + i.substring(1) : i] = t[i]);
            return n
        }
        class eU extends eP {
            constructor() {
                super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = K
            }
            getBaseTargetFromProps(t, e) {
                return a.has(e) ? super.getBaseTargetFromProps(t, e) ?? tx(e) : t[e]
            }
            getDefaultValue(t) {
                return a.has(t) ? this.latestValues[t] ?? tx(t) : void 0
            }
            readValueFromInstance(t, e) {
                if (a.has(e)) {
                    let t = z(e);
                    return t && t.default || 0
                }
                if (eX.includes(e)) {
                    let i = getComputedStyle(t)[e];
                    if ("string" == typeof i && i) return i.trim()
                }
                return e = eB.has(e) ? e : eM(e), t.getAttribute(e)
            }
            scrapeMotionValuesFromProps(t, e, i) {
                return e_(t, e, i)
            }
            build(t, e, i) {
                eD(t, e, this.isSVGTag, i.transformTemplate, i.style)
            }
            renderInstance(t, e, i, n) {
                for (let i in eO(t, e, void 0, n), e.attrs) t.setAttribute(eB.has(i) ? i : eM(i), e.attrs[i])
            }
            mount(t) {
                this.isSVGTag = eL(t.tagName), super.mount(t)
            }
        }

        function eW({
            top: t,
            left: e,
            right: i,
            bottom: n
        }) {
            return {
                x: {
                    min: e,
                    max: i
                },
                y: {
                    min: t,
                    max: n
                }
            }
        }
        let ez = (t, e, i) => t + (e - t) * i;

        function eH(t) {
            return void 0 === t || 1 === t
        }

        function eq({
            scale: t,
            scaleX: e,
            scaleY: i
        }) {
            return !eH(t) || !eH(e) || !eH(i)
        }

        function eG(t) {
            return eq(t) || eK(t) || t.z || t.rotate || t.rotateX || t.rotateY || t.skewX || t.skewY
        }

        function eK(t) {
            var e, i;
            return (e = t.x) && "0%" !== e || (i = t.y) && "0%" !== i
        }

        function eZ(t, e, i, n, r) {
            return void 0 !== r && (t = n + r * (t - n)), n + i * (t - n) + e
        }

        function eJ(t, e = 0, i = 1, n, r) {
            t.min = eZ(t.min, e, i, n, r), t.max = eZ(t.max, e, i, n, r)
        }

        function eQ(t, {
            x: e,
            y: i
        }) {
            eJ(t.x, e.translate, e.scale, e.originPoint), eJ(t.y, i.translate, i.scale, i.originPoint)
        }

        function e0(t, e) {
            t.min += e, t.max += e
        }

        function e1(t, e, i, n, r = .5) {
            let s = ez(t.min, t.max, r);
            eJ(t, e, i, s, n)
        }

        function e5(t, e) {
            return "string" == typeof t ? parseFloat(t) / 100 * (e.max - e.min) : t
        }

        function e3(t, e, i) {
            let n = i ?? t;
            e1(t.x, e5(e.x, n.x), e.scaleX, e.scale, e.originX), e1(t.y, e5(e.y, n.y), e.scaleY, e.scale, e.originY)
        }

        function e2(t, e) {
            return eW(function(t, e) {
                if (!e) return t;
                let i = e({
                        x: t.left,
                        y: t.top
                    }),
                    n = e({
                        x: t.right,
                        y: t.bottom
                    });
                return {
                    top: i.y,
                    left: i.x,
                    bottom: n.y,
                    right: n.x
                }
            }(t.getBoundingClientRect(), e))
        }
        class e4 extends eP {
            constructor() {
                super(...arguments), this.type = "html", this.renderInstance = eO
            }
            mount(t) {
                ti(t.style), super.mount(t)
            }
            readValueFromInstance(t, e) {
                if (a.has(e)) return this.projection ?.isProjecting ? tx(e) : tb(t, e); {
                    let i = window.getComputedStyle(t),
                        n = (tr(e) ? i.getPropertyValue(e) : i[e]) || 0;
                    return "string" == typeof n ? n.trim() : n
                }
            }
            measureInstanceViewportBox(t, {
                transformPagePoint: e
            }) {
                return e2(t, e)
            }
            build(t, e, i) {
                eV(t, e, i.transformTemplate)
            }
            scrapeMotionValuesFromProps(t, e, i) {
                return eN(t, e, i)
            }
        }
        let e8 = ["animate", "circle", "defs", "desc", "ellipse", "g", "image", "line", "filter", "marker", "mask", "metadata", "path", "pattern", "polygon", "polyline", "rect", "stop", "switch", "symbol", "svg", "text", "tspan", "use", "view"];

        function e6(t) {
            if ("string" != typeof t || t.includes("-"));
            else if (e8.indexOf(t) > -1 || /[A-Z]/u.test(t)) return !0;
            return !1
        }
        let e9 = (0, s.createContext)({}),
            e7 = (0, s.createContext)({
                strict: !1
            }),
            it = (0, s.createContext)({
                transformPagePoint: t => t,
                isStatic: !1,
                reducedMotion: "never"
            }),
            ie = (0, s.createContext)({});

        function ii(t) {
            return Array.isArray(t) ? t.join(" ") : t
        }
        let ir = () => ({
            style: {},
            transform: {},
            transformOrigin: {},
            vars: {}
        });

        function is(t, e, i) {
            for (let n in e) Z(e[n]) || eF(n, i) || (t[n] = e[n])
        }
        let io = () => ({ ...ir(),
                attrs: {}
            }),
            ia = new Set(["animate", "exit", "variants", "initial", "style", "values", "transition", "transformTemplate", "custom", "inherit", "onBeforeLayoutMeasure", "onAnimationStart", "onAnimationComplete", "onUpdate", "onDragStart", "onDrag", "onDragEnd", "onMeasureDragConstraints", "onDirectionLock", "onDragTransitionEnd", "_dragX", "_dragY", "onHoverStart", "onHoverEnd", "onViewportEnter", "onViewportLeave", "globalTapTarget", "propagate", "ignoreStrict", "viewport"]);

        function il(t) {
            return t.startsWith("while") || t.startsWith("drag") && "draggable" !== t || t.startsWith("layout") || t.startsWith("onTap") || t.startsWith("onPan") || t.startsWith("onLayout") || ia.has(t)
        }

        function iu(t) {
            return Z(t) ? t.get() : t
        }

        function ih(t, e, i, n) {
            let r = e => {
                let r;
                return "function" == typeof e ? e(void 0 !== i ? i : t.custom, ...(r = [{}, {}], n ?.values.forEach((t, e) => {
                    r[0][e] = t.get(), r[1][e] = t.getVelocity()
                }), r)) : e
            };
            return "string" == typeof(e = r(e)) && (e = t.variants && t.variants[e]), r(e)
        }
        let id = (0, s.createContext)(null);

        function ic(t) {
            let e = (0, s.useRef)(null);
            return null === e.current && (e.current = t()), e.current
        }
        let ip = t => (e, i) => {
                let n = (0, s.useContext)(ie),
                    r = (0, s.useContext)(id),
                    o = () => (function({
                        scrapeMotionValuesFromProps: t,
                        createRenderState: e
                    }, i, n, r) {
                        return {
                            latestValues: function(t, e, i, n) {
                                let r = {},
                                    s = n(t, {});
                                for (let t in s) r[t] = iu(s[t]);
                                let {
                                    initial: o,
                                    animate: a
                                } = t, l = ey(t), u = ev(t);
                                e && u && !l && !1 !== t.inherit && (void 0 === o && (o = e.initial), void 0 === a && (a = e.animate));
                                let h = !!i && !1 === i.initial,
                                    d = (h = h || !1 === o) ? a : o;
                                if (d && "boolean" != typeof d && !ep(d)) {
                                    let e = Array.isArray(d) ? d : [d];
                                    for (let i = 0; i < e.length; i++) {
                                        let n = ih(t, e[i]);
                                        if (n) {
                                            let {
                                                transitionEnd: t,
                                                transition: e,
                                                ...i
                                            } = n;
                                            for (let t in i) {
                                                let e = i[t];
                                                if (Array.isArray(e)) {
                                                    let t = h ? e.length - 1 : 0;
                                                    e = e[t]
                                                }
                                                null !== e && (r[t] = e)
                                            }
                                            for (let e in t) r[e] = t[e]
                                        }
                                    }
                                }
                                return r
                            }(i, n, r, t),
                            renderState: e()
                        }
                    })(t, e, n, r);
                return i ? o() : ic(o)
            },
            im = ip({
                scrapeMotionValuesFromProps: eN,
                createRenderState: ir
            }),
            ig = ip({
                scrapeMotionValuesFromProps: e_,
                createRenderState: io
            }),
            iy = {
                animation: ["animate", "variants", "whileHover", "whileTap", "exit", "whileInView", "whileFocus", "whileDrag"],
                exit: ["exit"],
                drag: ["drag", "dragControls"],
                focus: ["whileFocus"],
                hover: ["whileHover", "onHoverStart", "onHoverEnd"],
                tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
                pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
                inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
                layout: ["layout", "layoutId"]
            },
            iv = !1;

        function ix() {
            return ! function() {
                if (iv) return;
                let t = {};
                for (let e in iy) t[e] = {
                    isEnabled: t => iy[e].some(e => !!t[e])
                };
                eS = t, iv = !0
            }(), eS
        }
        let iw = Symbol.for("motionComponentSymbol"),
            ib = "data-" + eM("framerAppearId"),
            iT = (0, s.createContext)({});

        function ik(t) {
            return t && "object" == typeof t && Object.prototype.hasOwnProperty.call(t, "current")
        }
        let iS = "u" > typeof window ? s.useLayoutEffect : s.useEffect;

        function iA(t, {
            forwardMotionProps: e = !1,
            type: i
        } = {}, n, o) {
            n && function(t) {
                let e = ix();
                for (let i in t) e[i] = { ...e[i],
                    ...t[i]
                };
                eS = e
            }(n);
            let a = i ? "svg" === i : e6(t),
                l = a ? ig : im;

            function u(i, n) {
                var u;
                let h, d, c, p = { ...(0, s.useContext)(it),
                        ...i,
                        layoutId: function({
                            layoutId: t
                        }) {
                            let e = (0, s.useContext)(e9).id;
                            return e && void 0 !== t ? e + "-" + t : t
                        }(i)
                    },
                    {
                        isStatic: m,
                        isValidProp: f
                    } = p,
                    g = function(t) {
                        let {
                            initial: e,
                            animate: i
                        } = function(t, e) {
                            if (ey(t)) {
                                let {
                                    initial: e,
                                    animate: i
                                } = t;
                                return {
                                    initial: !1 === e || em(e) ? e : void 0,
                                    animate: em(i) ? i : void 0
                                }
                            }
                            return !1 !== t.inherit ? e : {}
                        }(t, (0, s.useContext)(ie));
                        return (0, s.useMemo)(() => ({
                            initial: e,
                            animate: i
                        }), [ii(e), ii(i)])
                    }(i),
                    y = l(i, m);
                if (!m && "u" > typeof window) {
                    (0, s.useContext)(e7).strict;
                    let e = function(t) {
                        let {
                            drag: e,
                            layout: i
                        } = ix();
                        if (!e && !i) return {};
                        let n = { ...e,
                            ...i
                        };
                        return {
                            MeasureLayout: e ?.isEnabled(t) || i ?.isEnabled(t) ? n.MeasureLayout : void 0,
                            ProjectionNode: n.ProjectionNode
                        }
                    }(p);
                    h = e.MeasureLayout, g.visualElement = function(t, e, i, n, r, o) {
                        let {
                            visualElement: a
                        } = (0, s.useContext)(ie), l = (0, s.useContext)(e7), u = (0, s.useContext)(id), h = (0, s.useContext)(it), d = h.reducedMotion, c = h.skipAnimations, p = (0, s.useRef)(null), m = (0, s.useRef)(!1);
                        n = n || l.renderer, !p.current && n && (p.current = n(t, {
                            visualState: e,
                            parent: a,
                            props: i,
                            presenceContext: u,
                            blockInitialAnimation: !!u && !1 === u.initial,
                            reducedMotionConfig: d,
                            skipAnimations: c,
                            isSVG: o
                        }), m.current && p.current && (p.current.manuallyAnimateOnMount = !0));
                        let f = p.current,
                            g = (0, s.useContext)(iT);
                        f && !f.projection && r && ("html" === f.type || "svg" === f.type) && function(t, e, i, n) {
                            let {
                                layoutId: r,
                                layout: s,
                                drag: o,
                                dragConstraints: a,
                                layoutScroll: l,
                                layoutRoot: u,
                                layoutAnchor: h,
                                layoutCrossfade: d
                            } = e;
                            t.projection = new i(t.latestValues, e["data-framer-portal-id"] ? void 0 : function t(e) {
                                if (e) return !1 !== e.options.allowProjection ? e.projection : t(e.parent)
                            }(t.parent)), t.projection.setOptions({
                                layoutId: r,
                                layout: s,
                                alwaysMeasureLayout: !!o || a && ik(a),
                                visualElement: t,
                                animationType: "string" == typeof s ? s : "both",
                                initialPromotionConfig: n,
                                crossfade: d,
                                layoutScroll: l,
                                layoutRoot: u,
                                layoutAnchor: h
                            })
                        }(p.current, i, r, g);
                        let y = (0, s.useRef)(!1);
                        (0, s.useInsertionEffect)(() => {
                            f && y.current && f.update(i, u)
                        });
                        let v = i[ib],
                            x = (0, s.useRef)(!!v && "u" > typeof window && !window.MotionHandoffIsComplete ?.(v) && window.MotionHasOptimisedAnimation ?.(v));
                        return iS(() => {
                            m.current && f && (f.animationState ?.animateChanges(), f.enteringChildren = void 0)
                        }, []), iS(() => {
                            m.current = !0, f && (y.current = !0, window.MotionIsMounted = !0, f.updateFeatures(), f.scheduleRenderMicrotask(), x.current && f.animationState && f.animationState.animateChanges())
                        }), (0, s.useEffect)(() => {
                            f && (!x.current && f.animationState && f.animationState.animateChanges(), x.current && (queueMicrotask(() => {
                                window.MotionHandoffMarkAsComplete ?.(v)
                            }), x.current = !1), f.enteringChildren = void 0)
                        }), f
                    }(t, y, p, o, e.ProjectionNode, a)
                }
                return (0, r.jsxs)(ie.Provider, {
                    value: g,
                    children: [h && g.visualElement ? (0, r.jsx)(h, {
                        visualElement: g.visualElement,
                        ...p
                    }) : null, function(t, e, i, {
                        latestValues: n
                    }, r, o = !1, a, l) {
                        let u = (a ?? e6(t) ? function(t, e, i, n) {
                                let r = (0, s.useMemo)(() => {
                                    let i = io();
                                    return eD(i, e, eL(n), t.transformTemplate, t.style), { ...i.attrs,
                                        style: { ...i.style
                                        }
                                    }
                                }, [e]);
                                if (t.style) {
                                    let e = {};
                                    is(e, t.style, t), r.style = { ...e,
                                        ...r.style
                                    }
                                }
                                return r
                            } : function(t, e) {
                                let i, n, r = {},
                                    o = (i = t.style || {}, is(n = {}, i, t), Object.assign(n, function({
                                        transformTemplate: t
                                    }, e) {
                                        return (0, s.useMemo)(() => {
                                            let i = ir();
                                            return eV(i, e, t), Object.assign({}, i.vars, i.style)
                                        }, [e])
                                    }(t, e)), n);
                                return t.drag && !1 !== t.dragListener && (r.draggable = !1, o.userSelect = o.WebkitUserSelect = o.WebkitTouchCallout = "none", o.touchAction = !0 === t.drag ? "none" : `pan-${"x"===t.drag?"y":"x"}`), void 0 === t.tabIndex && (t.onTap || t.onTapStart || t.whileTap) && (r.tabIndex = 0), r.style = o, r
                            })(e, n, r, t),
                            h = function(t, e, i, n) {
                                let r = {};
                                for (let s in t)("values" !== s || "object" != typeof t.values) && !Z(t[s]) && ((s.startsWith("on") ? !il(s) : n ?.(s) ?? !il(s)) || !0 === i && il(s) || !e && !il(s) || t.draggable && s.startsWith("onDrag")) && (r[s] = t[s]);
                                return r
                            }(e, "string" == typeof t, o, l),
                            d = t !== s.Fragment ? { ...h,
                                ...u,
                                ref: i
                            } : {},
                            {
                                children: c
                            } = e,
                            p = (0, s.useMemo)(() => Z(c) ? c.get() : c, [c]);
                        return (0, s.createElement)(t, { ...d,
                            children: p
                        })
                    }(t, i, (u = g.visualElement, d = (0, s.useRef)(n), (0, s.useInsertionEffect)(() => {
                        d.current = n
                    }), c = (0, s.useRef)(null), (0, s.useCallback)(t => {
                        t && y.onMount ?.(t), u && (t ? u.mount(t) : u.unmount());
                        let e = d.current;
                        if ("function" == typeof e)
                            if (t) {
                                let i = e(t);
                                "function" == typeof i && (c.current = i)
                            } else c.current ? (c.current(), c.current = null) : e(t);
                        else e && (e.current = t)
                    }, [u])), y, m, e, a, f)]
                })
            }
            u.displayName = `motion.${"string"==typeof t?t:`create(${t.displayName??t.name??""})`}`;
            let h = (0, s.forwardRef)(u);
            return h[iw] = t, h
        }
        class iP {
            constructor(t) {
                this.isMounted = !1, this.node = t
            }
            update() {}
        }

        function iM(t, e, i) {
            return ih(t.getProps(), e, i, t)
        }
        let iC = (t, e) => "exit" === e ? t.presenceContext ?.custom : void 0;

        function iE(t, e) {
            if (t ?.inherit && e) {
                let {
                    inherit: i,
                    ...n
                } = t;
                return { ...e,
                    ...n
                }
            }
            return t
        }

        function iY(t, e) {
            let i = t ?.[e] ?? t ?.default ?? t;
            return i !== t ? iE(i, t) : i
        }

        function ij(t, e) {
            let i = t.getValue("willChange");
            if (Z(i) && i.add) return i.add(e);
            if (!i && tY.WillChange) {
                let i = new tY.WillChange("auto");
                t.addValue("willChange", i), i.add(e)
            }
        }
        let iV = (...t) => t.reduce((t, e) => i => e(t(i)));

        function iI(t, e, i) {
            return (i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6) ? t + (e - t) * 6 * i : i < .5 ? e : i < 2 / 3 ? t + (e - t) * (2 / 3 - i) * 6 : t
        }

        function iR(t, e) {
            return i => i > 0 ? e : t
        }
        let iX = (t, e, i) => {
                let n = t * t,
                    r = i * (e * e - n) + n;
                return r < 0 ? 0 : Math.sqrt(r)
            },
            iD = [x, v, M];

        function iB(t) {
            let e = iD.find(e => e.test(t));
            if (!e) return te(`'${t}' is not an animatable color. Use the equivalent color code instead.`), !1;
            let i = e.parse(t);
            return e === M && (i = function({
                hue: t,
                saturation: e,
                lightness: i,
                alpha: n
            }) {
                t /= 360, i /= 100;
                let r = 0,
                    s = 0,
                    o = 0;
                if (e /= 100) {
                    let n = i < .5 ? i * (1 + e) : i + e - i * e,
                        a = 2 * i - n;
                    r = iI(a, n, t + 1 / 3), s = iI(a, n, t), o = iI(a, n, t - 1 / 3)
                } else r = s = o = i;
                return {
                    red: Math.round(255 * r),
                    green: Math.round(255 * s),
                    blue: Math.round(255 * o),
                    alpha: n
                }
            }(i)), i
        }
        let iL = (t, e) => {
                let i = iB(t),
                    n = iB(e);
                if (!i || !n) return iR(t, e);
                let r = { ...i
                };
                return t => (r.red = iX(i.red, n.red, t), r.green = iX(i.green, n.green, t), r.blue = iX(i.blue, n.blue, t), r.alpha = ez(i.alpha, n.alpha, t), v.transform(r))
            },
            iO = new Set(["none", "hidden"]);

        function i$(t, e) {
            return i => ez(t, e, i)
        }

        function iF(t) {
            return "number" == typeof t ? i$ : "string" == typeof t ? to(t) ? iR : C.test(t) ? iL : iU : Array.isArray(t) ? iN : "object" == typeof t ? C.test(t) ? iL : i_ : iR
        }

        function iN(t, e) {
            let i = [...t],
                n = i.length,
                r = t.map((t, i) => iF(t)(t, e[i]));
            return t => {
                for (let e = 0; e < n; e++) i[e] = r[e](t);
                return i
            }
        }

        function i_(t, e) {
            let i = { ...t,
                    ...e
                },
                n = {};
            for (let r in i) void 0 !== t[r] && void 0 !== e[r] && (n[r] = iF(t[r])(t[r], e[r]));
            return t => {
                for (let e in n) i[e] = n[e](t);
                return i
            }
        }
        let iU = (t, e) => {
                let i = D.createTransformer(e),
                    n = R(t),
                    r = R(e);
                if (!(n.indexes.var.length === r.indexes.var.length && n.indexes.color.length === r.indexes.color.length && n.indexes.number.length >= r.indexes.number.length)) return te(`Complex values '${t}' and '${e}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`), iR(t, e);
                if (iO.has(t) && !r.values.length || iO.has(e) && !n.values.length) return iO.has(t) ? i => i <= 0 ? t : e : i => i >= 1 ? e : t;
                return iV(iN(function(t, e) {
                    let i = [],
                        n = {
                            color: 0,
                            var: 0,
                            number: 0
                        };
                    for (let r = 0; r < e.values.length; r++) {
                        let s = e.types[r],
                            o = t.indexes[s][n[s]],
                            a = t.values[o] ?? 0;
                        i[r] = a, n[s]++
                    }
                    return i
                }(n, r), r.values), i)
            },
            iW = /^(-?(?:\d+(?:\.\d*)?|\.\d+))([a-z%]*)$/iu;

        function iz(t, e, i) {
            if ("number" == typeof t && "number" == typeof e && "number" == typeof i) return ez(t, e, i);
            if ("string" == typeof t && "string" == typeof e) {
                let i = function(t, e) {
                    let i = iW.exec(t);
                    if (!i) return;
                    let n = iW.exec(e);
                    if (!n || i[2] !== n[2]) return;
                    let r = i[2],
                        s = parseFloat(i[1]),
                        o = parseFloat(n[1]);
                    return t => c(ez(s, o, t)) + r
                }(t, e);
                if (i) return i
            }
            return iF(t)(t, e)
        }
        let iH = t => {
            let e = ({
                timestamp: e
            }) => t(e);
            return {
                start: (t = !0) => tR.update(e, t),
                stop: () => tX(e),
                now: () => tI.isProcessing ? tI.timestamp : t4.now()
            }
        };

        function iq(t, e = 50, i = 2e4, n) {
            let r = 0,
                s = t.next(r);
            for (n ?.push(s.value); !s.done && r < i;) r += e, s = t.next(r), n ?.push(s.value);
            return r >= i ? 1 / 0 : r
        }

        function iG(t, e = 100, i) {
            let {
                keyframes: n,
                velocity: r
            } = t, s = n && n[n.length - 1] - n[0], o = i({ ...t,
                velocity: r && s ? r * e / s : r,
                keyframes: [0, e]
            }), a = Math.min(iq(o), 2e4);
            return {
                type: "keyframes",
                ease: t => o.next(a * t).value / e,
                duration: a / 1e3
            }
        }
        let iK = .01,
            iZ = 2,
            iJ = .005,
            iQ = .5,
            i0 = t => t < 0 ? 1 / Math.max(1 + t, .05) : Math.max(1 - t, .05);

        function i1(t, e) {
            if (!(t > 1)) return 1;
            let i = Math.sqrt(t * t - 1),
                n = t - i,
                r = t + i,
                s = 2 * i * Math.exp(-e) * (1 + e);
            return i3(t => r * Math.exp(-n * t) - n * Math.exp(-r * t) - s, t => Math.exp(-r * t) - Math.exp(-n * t), e) / e
        }

        function i5(t, e) {
            return t * Math.sqrt(1 - e * e)
        }

        function i3(t, e, i) {
            let n = i;
            for (let i = 1; i < 12; i++) n -= t(n) / e(n);
            return n
        }
        let i2 = (t, e) => (e ? t >= 0 : t > 0) && t < 1 / 0;

        function i4(t, e) {
            if (i2(t, e)) return t
        }

        function i8(t = .3, e = .3) {
            let i, n, r, s = "object" != typeof t ? {
                    visualDuration: t,
                    keyframes: [0, 1],
                    bounce: e
                } : t,
                o = s.keyframes[0],
                a = s.keyframes[s.keyframes.length - 1],
                u = {
                    done: !1,
                    value: o
                },
                {
                    stiffness: h,
                    damping: d,
                    mass: c,
                    duration: p,
                    isResolvedFromDuration: m,
                    isTimeDefined: f
                } = function(t) {
                    let e = i4(t.stiffness),
                        i = i4(t.damping, !0),
                        n = i4(t.mass),
                        r = { ...t,
                            stiffness: e ?? 100,
                            damping: i ?? 10,
                            mass: n ?? 1,
                            isResolvedFromDuration: !1,
                            isTimeDefined: (e ?? i ?? n) === void 0 && (void 0 !== t.duration || void 0 !== t.bounce)
                        };
                    if (r.isTimeDefined) {
                        if (t.visualDuration) {
                            let e = i0(t.bounce || 0),
                                i = 2 * Math.PI / (1.2 * t.visualDuration) * i1(e, 2 * Math.PI / 1.2);
                            r.stiffness = i * i, r.damping = 2 * e * Math.sqrt(r.stiffness)
                        } else Object.assign(r, function({
                            duration: t = 800,
                            bounce: e = .3
                        }) {
                            let i, n;
                            te(tz(10));
                            let r = i0(e);
                            t = l(.01, 10, t / 1e3), r < 1 ? (i = e => {
                                let i = e * r,
                                    n = i * t;
                                return .001 - i / i5(e, r) * Math.exp(-n)
                            }, n = e => {
                                let n = e * r * t,
                                    s = r * r * e * e * t,
                                    o = Math.exp(-n),
                                    a = i5(e * e, r);
                                return -((-i(e) + .001 > 0 ? -1 : 1) * s) * o / a
                            }) : (i = e => -.001 + Math.exp(-e * t) * (e * t + 1), n = e => -(t * t * e * Math.exp(-e * t)));
                            let s = i3(i, n, 5 / t),
                                o = s * i1(r, s * t),
                                a = o * o;
                            return {
                                stiffness: a,
                                damping: 2 * r * Math.sqrt(a),
                                duration: tz(t)
                            }
                        }(r)), r.isResolvedFromDuration = !0;
                        i2(r.stiffness) && i2(r.damping, !0) || (r.stiffness = 100, r.damping = 10)
                    }
                    return r
                }({ ...s
                }),
                g = t => f ? 0 : -(t / 1e3),
                y = d / (2 * Math.sqrt(h * c)),
                v = Math.sqrt(h / c) / 1e3,
                x = y * v,
                w = {
                    target: a,
                    delta: a - o,
                    velocity: g(s.velocity || 0) || 0,
                    restSpeed: 0,
                    restDelta: 0
                },
                b = () => {
                    let t = 5 > Math.abs(w.delta);
                    w.restSpeed = s.restSpeed || (t ? iK : iZ), w.restDelta = s.restDelta || (t ? iJ : iQ)
                };
            if (b(), y < 1) {
                let t = i5(v, y),
                    e = {
                        A: 0,
                        sinC: 0,
                        cosC: 0,
                        t: -1,
                        env: 0,
                        sin: 0,
                        cos: 0
                    };
                r = () => {
                    e.A = (w.velocity + x * w.delta) / t, e.sinC = x * e.A + w.delta * t, e.cosC = x * w.delta - e.A * t
                };
                let s = i => {
                    i !== e.t && (e.t = i, e.env = Math.exp(-x * i), e.sin = Math.sin(t * i), e.cos = Math.cos(t * i))
                };
                i = t => (s(t), w.target - e.env * (e.A * e.sin + w.delta * e.cos)), n = t => (s(t), e.env * (e.sinC * e.sin + e.cosC * e.cos))
            } else if (1 === y) {
                i = t => w.target - Math.exp(-v * t) * (w.delta + (w.velocity + v * w.delta) * t);
                let t = {
                    C: 0
                };
                r = () => {
                    t.C = w.velocity + v * w.delta
                }, n = e => Math.exp(-v * e) * (v * t.C * e - w.velocity)
            } else {
                let t = v * Math.sqrt(y * y - 1),
                    e = x - t,
                    s = x + t,
                    o = f ? 1 / 0 : 300 / t,
                    a = (t, e) => Math.exp(e > o ? -t * o - x * (e - o) : -t * e),
                    l = {
                        S: 0,
                        F: 0
                    };
                r = () => {
                    let e = (w.velocity + x * w.delta) / t;
                    l.S = (w.delta + e) / 2, l.F = (w.delta - e) / 2
                }, i = t => w.target - l.S * a(e, t) - l.F * a(s, t), n = t => e * l.S * a(e, t) + s * l.F * a(s, t)
            }
            r();
            let T = m && p || null,
                k = {
                    calculatedDuration: T,
                    retarget: (t, e) => {
                        w.target = t[t.length - 1], w.delta = w.target - t[0], w.velocity = g(e), s.restSpeed && s.restDelta || b(), k.calculatedDuration = T, u.done = !1, r()
                    },
                    velocity: t => tz(n(t)),
                    next: t => {
                        let e = i(t);
                        return m ? u.done = t >= p : u.done = Math.abs(tz(n(t))) <= w.restSpeed && Math.abs(w.target - e) <= w.restDelta, u.value = u.done ? w.target : e, u
                    },
                    toString: () => {
                        let t = Math.min(iq(k), 2e4),
                            e = et(e => k.next(t * e).value, t, 30);
                        return t + "ms " + e
                    },
                    toTransition: () => {}
                };
            return k
        }

        function i6({
            keyframes: t,
            velocity: e = 0,
            power: i = .8,
            timeConstant: n = 325,
            bounceDamping: r = 10,
            bounceStiffness: s = 500,
            modifyTarget: o,
            min: a,
            max: l,
            restDelta: u = .5,
            restSpeed: h
        }) {
            let d, c, p = t[0],
                m = {
                    done: !1,
                    value: p
                },
                f = i * e,
                g = p + f,
                y = void 0 === o ? g : o(g);
            y !== g && (f = y - p);
            let v = t => -f * Math.exp(-t / n),
                x = t => {
                    let e = v(t);
                    m.done = Math.abs(e) <= u, m.value = m.done ? y : y + e
                },
                w = t => {
                    let e;
                    if ((e = m.value) < a || e > l) {
                        var i;
                        d = t, c = i8({
                            keyframes: [m.value, (i = m.value, void 0 === a ? l : void 0 === l || Math.abs(a - i) < Math.abs(l - i) ? a : l)],
                            velocity: -v(t) / n * 1e3,
                            damping: r,
                            stiffness: s,
                            restDelta: u,
                            restSpeed: h
                        })
                    }
                };
            return w(0), {
                calculatedDuration: null,
                next: t => {
                    let e = !1;
                    return (c || void 0 !== d || (e = !0, x(t), w(t)), void 0 !== d && t >= d) ? c.next(t - d) : (e || x(t), m)
                }
            }
        }
        i8.applyToOptions = t => {
            let e = iG(t, 100, i8);
            return t.ease = e.ease, t.duration = tz(e.duration), t.type = "keyframes", t
        };
        let i9 = (t, e, i) => t * (3 * (1 - t) * ((1 - t) * e + t * i) + t * t);

        function i7(t, e, i, n) {
            return t === e && i === n ? tE : r => {
                let s = 0,
                    o = 1,
                    a = r;
                for (let e = 0;; e++) {
                    a >= s && a <= o || (a = (s + o) / 2);
                    let n = i9(a, t, i) - r;
                    if (n * n < 1e-28 || 40 === e) break;
                    n > 0 ? o = a : s = a, a -= 1e-7 * n / (i9(a + 1e-7, t, i) - r - n)
                }
                return i9(a, e, n)
            }
        }
        let nt = i7(.42, 0, 1, 1),
            ne = i7(0, 0, .58, 1),
            ni = i7(.42, 0, .58, 1),
            nn = t => Array.isArray(t) && "number" != typeof t[0],
            nr = t => e => e <= .5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2,
            ns = t => e => 1 - t(1 - e),
            no = i7(.33, 1.53, .69, .99),
            na = ns(no),
            nl = nr(na),
            nu = t => t >= 1 ? 1 : (t *= 2) < 1 ? .5 * na(t) : .5 * (2 - Math.pow(2, -10 * (t - 1))),
            nh = t => 1 - Math.sin(Math.acos(t)),
            nd = ns(nh),
            nc = nr(nh),
            np = {
                linear: tE,
                easeIn: nt,
                easeInOut: ni,
                easeOut: ne,
                circIn: nh,
                circInOut: nc,
                circOut: nd,
                backIn: na,
                backInOut: nl,
                backOut: no,
                anticipate: nu
            },
            nm = t => {
                if (t9(t)) {
                    ti(t.length);
                    let [e, i, n, r] = t;
                    return i7(e, i, n, r)
                }
                return "string" == typeof t ? (ti(np[t], `Invalid easing type '${t}'`), np[t]) : t
            },
            nf = (t, e, i) => {
                let n = e - t;
                return n ? (i - t) / n : 1
            };

        function ng(t, e, {
            clamp: i = !0,
            ease: n,
            mixer: r
        } = {}) {
            let s = t.length;
            if (ti(e.length), 1 === s) return () => e[0];
            if (2 === s && e[0] === e[1]) return () => e[1];
            let o = t[0] === t[1];
            t[0] > t[s - 1] && (t = [...t].reverse(), e = [...e].reverse());
            let a = function(t, e, i) {
                    let n = [],
                        r = i || tY.mix || iz,
                        s = t.length - 1;
                    for (let i = 0; i < s; i++) {
                        let s = r(t[i], t[i + 1]);
                        e && (s = iV(Array.isArray(e) ? e[i] || tE : e, s)), n.push(s)
                    }
                    return n
                }(e, n, r),
                u = a.length,
                h = i => {
                    if (o && i < t[0]) return e[0];
                    let n = 0;
                    if (u > 1)
                        for (; n < t.length - 2 && !(i < t[n + 1]); n++);
                    let r = nf(t[n], t[n + 1], i);
                    return a[n](r)
                };
            return i ? e => h(l(t[0], t[s - 1], e)) : h
        }

        function ny(t, e) {
            let i = t[t.length - 1];
            for (let n = 1; n <= e; n++) {
                let r = nf(0, e, n);
                t.push(ez(i, 1, r))
            }
        }

        function nv(t) {
            let e = [0];
            return ny(e, t.length - 1), e
        }

        function nx({
            duration: t = 300,
            keyframes: e,
            times: i,
            ease: n = "easeInOut"
        }) {
            var r;
            let s = nn(n) ? n.map(nm) : nm(n) || ni,
                o = {
                    done: !1,
                    value: e[0]
                };
            if (2 === e.length && !Array.isArray(s) && (!i || 2 !== i.length || 0 === i[0] && 1 === i[1])) {
                let [i, n] = e, r = i === n ? void 0 : (tY.mix || iz)(i, n);
                return {
                    calculatedDuration: t,
                    next: e => (o.value = r ? r(s(t > 0 ? l(0, 1, e / t) : 1)) : n, o.done = e >= t, o)
                }
            }
            let a = ng((r = i && i.length === e.length ? i : nv(e), r.map(e => e * t)), e, {
                ease: Array.isArray(s) ? s : e.map(() => s || ni).splice(0, e.length - 1)
            });
            return {
                calculatedDuration: t,
                next: e => (o.value = a(e), o.done = e >= t, o)
            }
        }

        function nw(t, e, i = 0) {
            var n, r;
            let s;
            return e <= 0 ? i : t.velocity ? t.velocity(e) : (n = e => t.next(e).value, r = t.next(e).value, el(r - n(s = Math.max(e - 5, 0)), e - s))
        }
        let nb = {
            decay: i6,
            inertia: i6,
            tween: nx,
            keyframes: nx,
            spring: i8
        };

        function nT(t) {
            "string" == typeof t.type && (t.type = nb[t.type])
        }
        let nk = (t, e) => e - t > 40 && !tY.useManualTiming ? e : t,
            nS = t => t / 100,
            nA = t => Math.round(1e4 * t) / 1e4;
        class nP extends t3 {
            constructor(t) {
                super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
                    done: !1,
                    value: void 0
                }, this.stop = () => {
                    let {
                        motionValue: t
                    } = this.options;
                    t && t.updatedAt !== t4.now() && this.tick(t4.now()), this.isStopped = !0, "idle" !== this.state && (this.teardown(), this.options.onStop ?.())
                }, this.options = t, this.initAnimation(), this.play(), !1 === t.autoplay && this.pause(), t6(this, this.options)
            }
            initAnimation() {
                let {
                    options: t
                } = this;
                nT(t);
                let {
                    type: e = nx,
                    repeat: i = 0,
                    repeatDelay: n = 0,
                    repeatType: r,
                    velocity: s = 0
                } = t, {
                    keyframes: o
                } = t, a = e || nx;
                a !== nx && "number" != typeof o[0] && (this.mixKeyframes = iV(nS, iz(o[0], o[1])), o = [0, 100]);
                let l = a(o === t.keyframes ? t : { ...t,
                    keyframes: o
                });
                "mirror" === r && (this.mirroredGenerator = a({ ...t,
                    keyframes: [...o].reverse(),
                    velocity: -s
                })), null === l.calculatedDuration && (l.calculatedDuration = iq(l));
                let {
                    calculatedDuration: u
                } = l;
                this.calculatedDuration = u, this.resolvedDuration = u + n, this.totalDuration = this.resolvedDuration * (i + 1) - n, this.generator = l
            }
            updateTime(t) {
                let e = Math.round(t - this.startTime) * this.playbackSpeed;
                null !== this.holdTime ? this.currentTime = this.holdTime : this.currentTime = e
            }
            tick(t, e = !1) {
                let {
                    generator: i,
                    totalDuration: n,
                    calculatedDuration: r
                } = this;
                if (null === this.startTime) return i.next(0);
                let {
                    delay: s = 0,
                    keyframes: o,
                    type: a,
                    onUpdate: l,
                    finalKeyframe: u
                } = this.options;
                this.startTime === this.pendingStartTime && (this.startTime = nk(this.startTime, t)), this.pendingStartTime = void 0, this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - n / this.speed, this.startTime)), e ? this.currentTime = t : this.updateTime(t);
                let h = this.currentTime - s * (this.playbackSpeed >= 0 ? 1 : -1),
                    d = this.playbackSpeed >= 0 ? h < 0 : h > n;
                this.currentTime = Math.max(h, 0), "finished" === this.state && null === this.holdTime && (this.currentTime = n);
                let c = this.generate(this.currentTime, d),
                    {
                        done: p
                    } = c;
                d || null === r || (p = this.playbackSpeed >= 0 ? this.currentTime >= n : this.currentTime <= 0);
                let m = null === this.holdTime && ("finished" === this.state || "running" === this.state && p);
                return m && a !== i6 && (c.value = t5(o, this.options, u, this.speed)), l && l(c.value), m && this.finish(), c
            }
            at(t) {
                return this.holdTime ?? nA((t - this.startTime) * this.playbackSpeed)
            }
            sampleAt(t, e) {
                let {
                    options: i,
                    totalDuration: n
                } = this, r = this.at(t) - (i.delay || 0);
                return r >= n && i.type !== i6 ? t5(i.keyframes, i, e ? void 0 : i.finalKeyframe) : this.generate(Math.max(r, 0), r < 0).value
            }
            generate(t, e) {
                let i, {
                        generator: n,
                        totalDuration: r,
                        mixKeyframes: s,
                        mirroredGenerator: o,
                        resolvedDuration: a
                    } = this,
                    {
                        keyframes: u,
                        repeat: h,
                        repeatType: d,
                        repeatDelay: c
                    } = this.options,
                    p = t,
                    m = n;
                if (h) {
                    let e = Math.min(t, r) / a,
                        i = Math.floor(e),
                        n = e % 1;
                    !n && e >= 1 && (n = 1), 1 === n && i--, (i = Math.min(i, h + 1)) % 2 && ("reverse" === d ? (n = 1 - n, c && (n -= c / a)) : "mirror" === d && (m = o)), p = l(0, 1, n) * a
                }
                return e ? (this.delayState.value = u[0], i = this.delayState) : i = m.next(p), s && !e && (i.value = s(i.value)), i
            }
            then(t, e) {
                return this.finished.then(t, e)
            }
            get duration() {
                return this.calculatedDuration / 1e3
            }
            get iterationDuration() {
                let {
                    delay: t = 0
                } = this.options || {};
                return this.duration + t / 1e3
            }
            get time() {
                return this.currentTime / 1e3
            }
            set time(t) {
                t = tz(t), this.currentTime = t, null === this.startTime || null !== this.holdTime || 0 === this.playbackSpeed ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = t, this.tick(t))
            }
            getGeneratorVelocity() {
                return nw(this.generator, this.currentTime, this.options.velocity)
            }
            get speed() {
                return this.playbackSpeed
            }
            set speed(t) {
                let e = this.playbackSpeed !== t;
                e && this.driver && this.updateTime(t4.now()), this.playbackSpeed = t, e && this.driver && (this.time = this.currentTime / 1e3)
            }
            play() {
                if (this.isStopped) return;
                let {
                    driver: t = iH,
                    startTime: e
                } = this.options;
                this.driver || (this.driver = t(t => this.tick(t))), this.options.onPlay ?.();
                let i = this.driver.now();
                "finished" === this.state ? (this.updateFinished(), this.startTime = i) : null !== this.holdTime ? this.startTime = i - this.holdTime / (this.playbackSpeed || 1) : this.startTime || (this.startTime = e ?? (this.pendingStartTime = i)), "finished" === this.state && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start()
            }
            pause() {
                this.state = "paused", this.updateTime(t4.now()), this.holdTime = this.currentTime
            }
            complete() {
                "running" !== this.state && this.play(), this.state = "finished", this.holdTime = null
            }
            finish() {
                this.notifyFinished(), this.teardown(), this.state = "finished", this.options.onComplete ?.()
            }
            cancel() {
                this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), this.options.onCancel ?.()
            }
            teardown() {
                this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null
            }
            stopDriver() {
                this.driver && (this.driver.stop(), this.driver = void 0)
            }
            sample(t) {
                return this.startTime = 0, this.tick(t, !0)
            }
            attachTimeline(t) {
                return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), this.driver ?.stop(), t.observe(this)
            }
        }
        let nM = {
            anticipate: nu,
            backInOut: nl,
            circInOut: nc
        };
        class nC extends er {
            constructor(t) {
                "string" == typeof t.ease && t.ease in nM && (t.ease = nM[t.ease]), nT(t), super(t), void 0 !== t.startTime && !1 !== t.autoplay && (this.startTime = t.startTime), this.options = t
            }
            elapsed() {
                return "running" === this.state ? (t4.now() - this.startTime) * this.speed : 1e3 * this.time
            }
            sample(t) {
                if (!this.sampler) {
                    let {
                        motionValue: t,
                        onUpdate: e,
                        onComplete: i,
                        onPlay: n,
                        onStop: r,
                        element: s,
                        ...o
                    } = this.options;
                    this.sampler = new nP({ ...o,
                        autoplay: !1
                    }), this.sampler.stop()
                }
                return this.sampler.sample(Math.max(0, t)).value
            }
            liveValue() {
                let {
                    state: t
                } = this;
                if ("running" === t || "paused" === t) return this.sample(this.elapsed())
            }
            updateMotionValue(t) {
                let {
                    motionValue: e,
                    element: i,
                    name: n
                } = this.options;
                if (!e) return;
                if (void 0 !== t) return void e.set(t);
                let {
                    speed: r
                } = this, s = this.elapsed(), o = "running" === this.state && r ? l(0, 10, s) : 0, a = this.sample(s);
                i && n && tK(i, n, a), e.setWithVelocity(this.sample(s - o * Math.sign(r)), a, o / Math.abs(r || 1))
            }
        }
        let nE = (t, e) => "zIndex" !== e && !!("number" == typeof t || Array.isArray(t) || "string" == typeof t && (D.test(t) || "0" === t) && !t.startsWith("url("));

        function nY(t) {
            t.duration = 0, t.type = "keyframes"
        }
        let nj = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/,
            nV = new Set(["color", "backgroundColor", "outlineColor", "fill", "stroke", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"]),
            nI = tZ(() => Object.hasOwnProperty.call(Element.prototype, "animate")),
            nR = (t, e) => t - e,
            nX = (t, e, i) => {
                let n = [];
                for (let r = 0; r <= i; r++) n.push(ez(t, e, r / i));
                return n
            },
            nD = (t, e) => t.latestValues ? t.latestValues[e] : t.getValue(e) ?.get();
        class nB extends nP {
            constructor(t) {
                let e = t.motionValue.owner.current,
                    {
                        driver: i = iH
                    } = t,
                    n = function(t) {
                        let e = t.motionValue.owner,
                            {
                                onUpdate: i,
                                transformTemplate: n
                            } = e.getProps();
                        return !t.isHandoff && !i && !t.hasOnUpdate && !n && "inertia" !== t.type && "none" === (nD(e, "transform") || "none") && !nD(e, "pathRotation") && !e.projection ?.isProjecting()
                    }(t);
                t.driver = t => {
                    let n = i(t);
                    return {
                        js: n,
                        now: n.now,
                        start: (t = !0) => {
                            let i = eo.get(e);
                            !i || i.isJS ? n.start(t) : i.schedule(!1, !t)
                        },
                        stop: () => {
                            n.stop();
                            let t = eo.get(e);
                            t ?.schedule(!t.isFinishing)
                        }
                    }
                }, super(t), this.canAccelerate = n;
                let {
                    stop: r
                } = this;
                this.stop = () => {
                    this.isAccelerated() && this.sync(), r()
                }
            }
            get group() {
                let t;
                return t = this.options.motionValue.owner.current, eo.get(t)
            }
            get js() {
                return this.driver ?.js
            }
            get name() {
                return this.options.name
            }
            timing() {
                let {
                    startTime: t,
                    speed: e,
                    totalDuration: i
                } = this, {
                    delay: n = 0,
                    repeatType: r
                } = this.options;
                return null !== this.holdTime ? [1 / 0, 0] : 1 / 0 === i ? [t + n / e, this.resolvedDuration * ("loop" === r ? 1 : 2) / e || 1] : [t + (n + i) / e, 0]
            }
            isAccelerated() {
                let {
                    group: t,
                    state: e
                } = this;
                return t ?.tracks.has(this) && !t.isJS && this.canAccelerate && ("running" === e || "paused" === e)
            }
            liveValue() {
                return this.isAccelerated() ? this.sampleAt(t4.now()) : void 0
            }
            tween() {
                let {
                    keyframes: t,
                    type: e,
                    ease: i,
                    times: n,
                    repeat: r,
                    delay: s = 0
                } = this.options, o = t9(i) ? ee(i) : /^(linear|ease(In|Out|InOut))$/.test(i) && ei[i];
                if (o && !r && !n && 2 === t.length && e === nx && null === this.holdTime) {
                    let t = this.startTime + s / this.speed;
                    return [t, t + this.resolvedDuration / this.speed, o]
                }
            }
            boundaries(t, e) {
                let {
                    startTime: i,
                    speed: n,
                    resolvedDuration: r,
                    options: s
                } = this, {
                    delay: o = 0,
                    repeat: a = 0,
                    repeatDelay: l = 0,
                    repeatType: u,
                    times: h,
                    keyframes: d,
                    type: c
                } = s, p = (c || nx) === nx ? h || nv(d) : [0, 1], m = i + o / n, f = [];
                if (null !== this.holdTime || !(r > 0)) return f;
                for (let i = Math.max(0, Math.floor((t - m) * n / r)); i <= a; i++) {
                    let s = m + i * r / n;
                    if (s > e) break;
                    for (let o of p) {
                        let a = s + (i % 2 && u && "loop" !== u ? 1 - o : o) * (r - l) / n;
                        a > t && a < e && f.push(a)
                    }
                }
                return f
            }
            numberAt(t) {
                return parseFloat(this.sampleAt(t, !0))
            }
            sync() {
                let t = t4.now();
                this.options.motionValue.setWithVelocity(this.sampleAt(t - 10, !0), this.sampleAt(t, !0), 10)
            }
            play() {
                var t;
                let e, i, n, r, s, a, l, u, h, d, c, p, m, f, g, y, v, x, w, b;
                this.isStopped || ((this.group || (e = (t = this.options.motionValue.owner).current, i = new Set, n = new Map, r = {}, s = [], a = new Map, l = [], u = !1, h = !1, d = !1, c = -1 / 0, p = t => {
                    for (let e of i)
                        if (e.name === t) return !0
                }, m = (e, i) => {
                    let a = {};
                    for (let l of void 0 === e ? o : s) {
                        let s = n.get(l),
                            o = void 0 === e ? nD(t, l) : s ? s.sampleAt(i > e && !s.timing()[1] ? i : e) : r[l];
                        void 0 !== o && (a[l] = o)
                    }
                    return a
                }, f = (t = m()) => {
                    e.style.transform = ej(t, {})
                }, g = (t = !0) => {
                    t && f(), l.forEach(({
                        animation: t
                    }) => t.cancel()), l = []
                }, y = (t, e, i = 1 / 0) => {
                    let n = {
                        animation: t,
                        offset: e,
                        end: i
                    };
                    t.startTime = t4.now() + e, i < 1 / 0 && (t.onfinish = () => {
                        n.isDone = !0, l.some(t => 1 / 0 === t.end) && (t.cancel(), l = l.filter(t => t !== n)), b.schedule(!1)
                    }), t.oncancel = () => l.includes(n) && b.demote(), l.push(n)
                }, v = (t, e, i) => {
                    let n = (e, i) => Math.abs(t(i) - t(e)),
                        r = n(e, i);
                    for (; i - e > .01;) {
                        let t = (e + i) / 2;
                        n(e, t) > n(t, i) ? i = t : e = t
                    }
                    return n(e, i) > r / 2 ? [e, i] : []
                }, x = (t, i, n, r = {
                    fill: "both"
                }, s, o) => {
                    let a = t.flatMap(t => t.boundaries(i, n)),
                        l = o || ((t, e, i, n) => {
                            let r, s, o = Math.min(200, Math.max(2, Math.ceil((i - e) / 10)));
                            if (4 * n.length > o) return;
                            let a = nX(e, i, o).concat(n).sort(nR);
                            for (let e of t) {
                                let t = a.map(t => e.numberAt(t)),
                                    [i] = t,
                                    n = t[t.length - 1] - i,
                                    o = t.map(t => n ? (t - i) / n : t - i);
                                if (n)
                                    if (r) {
                                        if (o.some((t, e) => !(.001 >= Math.abs(t - r[e])))) return
                                    } else r = o, s = t => (e.numberAt(t) - i) / n;
                                else if (o.some(t => !(.001 >= Math.abs(t)))) return
                            }
                            if (!r || r.every((t, n) => .001 >= Math.abs(t - nf(e, i, a[n])))) return "linear";
                            let l = [],
                                u = (t, n = s(t)) => l.push(nA(n) + " " + nA(100 * nf(e, i, t)) + "%");
                            return r.forEach((t, e) => {
                                e && Math.abs(t - r[e - 1]) > .2 && v(s, a[e - 1], a[e]).forEach(t => u(t)), u(a[e], t)
                            }), "linear(" + l + ")"
                        })(t, i, n, a),
                        u = l ? [i, n] : ((t, e, i, n) => {
                            let r = [e],
                                s = (e, i, n) => {
                                    if (i - e < 1 || t.every(t => !(Math.abs(t.numberAt((e + i) / 2) - (t.numberAt(e) + t.numberAt(i)) / 2) > (t.name.startsWith("scale") ? .001 : .1)))) r.push(i);
                                    else if (n < 4) s(e, (e + i) / 2, n + 1), s((e + i) / 2, i, n + 1);
                                    else {
                                        for (let n of t) r.push(...v(t => n.numberAt(t), e, i));
                                        r.push(i)
                                    }
                                },
                                o = nX(e, i, Math.ceil((i - e) / 100));
                            for (let t of n) o.push(t, Math.min(t + .01, i));
                            let a = e;
                            for (let t of o.sort(nR)) t > a && s(a, t, 0), a = t;
                            return r.sort(nR)
                        })(t, i, n, a),
                        h = u.map(t => ((t, e) => {
                            let i = "",
                                n = m(t, e);
                            for (let t in n) i += (eE[t] || t) + "(" + eC(n[t], U[t]) + ") ";
                            return i || "none"
                        })(t, s)),
                        d = {
                            transform: h
                        };
                    return l || (d.offset = u.map(t => nf(i, n, t))), h.every(t => t === h[0]) && (f(m(i, s)), d = null), e.animate(d, { ...r,
                        duration: n - i,
                        easing: l || "linear"
                    })
                }, w = () => {
                    let p = t4.now();
                    if (b.isJS || (b.isFinishing = !0, i.forEach(e => {
                            let [i, n] = e.timing();
                            "running" === e.state && e.speed > 0 && !n && i <= p + 1 && (e.complete(), r[e.name] = nD(t, e.name), a.has(e) || (u = !0))
                        }), b.isFinishing = !1), h = !1, i.forEach(({
                            state: t
                        }, e) => {
                            ("idle" === t || "finished" === t) && i.delete(e)
                        }), !i.size) {
                        eo.delete(e), b.isJS || g();
                        return
                    }
                    for (let t of i)
                        if (!t.canAccelerate) return b.demote(!0);
                    b.isJS && (b.isJS = !1, u = !0, i.forEach(t => t.js ?.stop()));
                    let m = u,
                        f = d;
                    if (u = d = !1, m || !(t => {
                            let e, n = 0;
                            for (let r of i) {
                                let i = a.get(r);
                                if (!i) return !1;
                                let [s, o, l] = i, u = r.at(t), h = 1 / 0 === r.timing()[0];
                                if (l) {
                                    if (h && u === s) continue;
                                    return !1
                                }
                                let d = (u - s) / o,
                                    c = h ? 0 : r.speed / o;
                                if (void 0 === e) e = d, n = c;
                                else if (Math.abs(d - e) > 1 || c !== n) return !1
                            }
                            if (void 0 === e) return !0;
                            if (!l.length) return !1;
                            for (let {
                                    offset: t,
                                    end: i,
                                    isDone: n
                                } of l) {
                                let r = e - t;
                                if (i < 1 / 0 && (n ? r < i - 1 : r < 0 || r >= i)) return !1
                            }
                            for (let {
                                    animation: i,
                                    offset: r,
                                    isDone: s
                                } of l) {
                                if (s) continue;
                                let o = e - r;
                                n ? (i.playbackRate = n, i.startTime = t - o / n) : (i.pause(), i.currentTime = o)
                            }
                            return !0
                        })(p)) {
                        if (f) {
                            if (p - c < 100) return b.demote();
                            c = p
                        }
                        if (!(u => {
                                let h = u,
                                    d = 0,
                                    c = 0,
                                    p = [],
                                    m = [],
                                    f = new Set;
                                for (let t of (n.clear(), a = new Map, i)) {
                                    n.set(t.name, t);
                                    let [e, i] = t.timing(), r = 1 / 0 === e;
                                    if (a.set(t, [t.at(u), t.speed, r]), r) {
                                        t.sync();
                                        continue
                                    }
                                    if (t.speed < 0) return;
                                    if (i) {
                                        if (d) {
                                            let t = (e - c) / i;
                                            if (Math.abs(i - d) > 1 || Math.abs(t - Math.round(t)) * d > 1) return
                                        } else d = i, c = e;
                                        m.push(t)
                                    } else f.add(e);
                                    p.push(t), h = Math.max(h, e)
                                }
                                r = {}, s = o.filter(e => {
                                    if (n.has(e)) return !0;
                                    let i = r[e] = nD(t, e);
                                    return void 0 !== i && parseFloat(i) !== +!!e.startsWith("scale")
                                }), g(!1);
                                let v = !d && (t => {
                                    let e;
                                    for (let i of t) {
                                        let t = i.tween();
                                        if (!t || e ?.some((e, i) => i < 2 ? Math.abs(t[i] - e) > 1 : t[i] !== e)) return;
                                        e = t
                                    }
                                    return e
                                })(p);
                                try {
                                    if (v && v[1] > u) {
                                        let [t, e, i] = v;
                                        y(x(p, t, e, void 0, void 0, i), t - u, e - t)
                                    } else h > u && (y(x(p, u, h), 0, h - u), f.forEach(t => t < h - 1 && y(e.animate(null, {
                                        duration: t - u
                                    }), 0, t - u)));
                                    if (d) {
                                        let t = c + Math.floor((h - c) / d) * d;
                                        y(x(m, t, t + d, {
                                            iterations: 1 / 0,
                                            iterationStart: (h - t) / d,
                                            fill: "forwards"
                                        }, h), h - u)
                                    }
                                } catch {
                                    return
                                }
                                return l.length || g(), !0
                            })(p)) return b.demote()
                    }
                }, b = {
                    tracks: i,
                    isJS: !1,
                    isFinishing: !1,
                    schedule(t, e) {
                        u || (u = t), d || (d = !!e), h || (h = !0, tI.isProcessing ? tR.render(w, !1, !0) : queueMicrotask(w))
                    },
                    check() {
                        if (!b.isJS) {
                            for (let e in r)
                                if (nD(t, e) !== r[e] && !p(e)) return b.schedule(!0, !0)
                        }
                    },
                    demote(t) {
                        b.isJS || (i.forEach(e => {
                            e.isAccelerated() && e.sync(), t || (e.canAccelerate = !1)
                        }), b.isJS = !0, a = new Map, g(), i.forEach(t => "running" === t.state && t.js ?.start()))
                    }
                }, eo.set(e, b), b)).tracks.add(this), super.play())
            }
            pause() {
                super.pause(), this.isAccelerated() && (this.sync(), this.group.schedule(!1))
            }
            complete() {
                super.complete();
                let {
                    group: t
                } = this;
                t && !t.isJS && this.canAccelerate && this.tick(t4.now())
            }
            get time() {
                return this.isAccelerated() ? l(0, this.totalDuration, this.at(t4.now()) - (this.options.delay || 0)) / 1e3 : super.time
            }
            set time(t) {
                super.time = t
            }
            attachTimeline(t) {
                return this.canAccelerate = !1, this.group ?.demote(!0), super.attachTimeline(t)
            }
        }
        class nL extends t3 {
            constructor(t) {
                super(), this.stop = () => {
                    this._animation && (this._animation.stop(), this.stopTimeline ?.()), this.keyframeResolver ?.cancel()
                }, this.createdAt = t4.now();
                let {
                    keyframes: e,
                    name: i,
                    motionValue: n,
                    element: r
                } = t;
                t.autoplay ?? (t.autoplay = !0), t.delay ?? (t.delay = 0), t.type ?? (t.type = "keyframes"), t.repeat ?? (t.repeat = 0), t.repeatDelay ?? (t.repeatDelay = 0), t.repeatType ?? (t.repeatType = "loop");
                let s = r ?.KeyframeResolver || t_;
                this.keyframeResolver = new s(e, (e, i, n) => this.onKeyframesResolved(e, i, t, !n), i, n, r), this.keyframeResolver ?.scheduleResolve()
            }
            onKeyframesResolved(t, e, i, n) {
                let r;
                this.keyframeResolver = void 0;
                let {
                    name: s,
                    type: a,
                    velocity: l,
                    delay: u,
                    isHandoff: h,
                    onUpdate: d
                } = i;
                this.resolvedAt = t4.now();
                let c = !0;
                ! function(t, e, i, n) {
                    let r = t[0];
                    if (null === r) return !1;
                    if ("display" === e || "visibility" === e) return !0;
                    let s = t[t.length - 1],
                        o = nE(r, e),
                        a = nE(s, e);
                    return o && a ? function(t) {
                        let e = t[0];
                        if (1 === t.length) return !0;
                        for (let i = 0; i < t.length; i++)
                            if (t[i] !== e) return !0
                    }(t) || ("spring" === i || en(i)) && n : (o !== a && te(`You are trying to animate ${e} from "${r}" to "${s}". "${o?s:r}" is not an animatable value.`), !1)
                }(t, s, a, l) && (c = !1, (tY.instantAnimations || !u) && d ?.(t5(t, i, e)), t[0] = t[t.length - 1], nY(i), i.repeat = 0);
                let {
                    onComplete: p
                } = i;
                i.finalKeyframe = e, i.keyframes = t, i.onComplete = () => {
                    p ?.(), this.notifyFinished()
                };
                let m = c && !h && function(t) {
                        let {
                            motionValue: e,
                            name: i,
                            repeatDelay: n,
                            repeatType: r,
                            damping: s,
                            type: o,
                            keyframes: a
                        } = t;
                        if (!i || !(es.has(i) || nV.has(i))) return !1;
                        let l = e ?.owner ?.current;
                        if (!(l instanceof HTMLElement) && !(l instanceof SVGElement)) return !1;
                        let {
                            onUpdate: u,
                            transformTemplate: h
                        } = e.owner.getProps();
                        return nI() && (es.has(i) || nV.has(i) && function(t) {
                            for (let e = 0; e < t.length; e++)
                                if ("string" == typeof t[e] && nj.test(t[e])) return !0;
                            return !1
                        }(a)) && ("transform" !== i || !h) && !u && !n && "mirror" !== r && 0 !== s && "inertia" !== o
                    }(i),
                    f = !m && (({
                        name: t,
                        motionValue: e
                    }) => t && o.includes(t) && e ?.owner ?.current instanceof HTMLElement && nI() && t7())(i);
                if (n && (m || f || this.resolvedAt !== this.createdAt) && (i.startTime ?? (i.startTime = nk(this.createdAt, this.resolvedAt))), m) {
                    i.element = i.motionValue ?.owner ?.current;
                    try {
                        r = new nC(i)
                    } catch {
                        r = new nP(i)
                    }
                } else r = f ? new nB(i) : new nP(i);
                this.pendingTimeline && (this.stopTimeline = r.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = r
            }
            get finished() {
                return this._animation ? this._animation.finished : super.finished
            }
            then(t, e) {
                return this.finished.finally(t).then(() => {})
            }
            liveValue() {
                return this._animation ?.liveValue ?.()
            }
            get animation() {
                return this._animation || (this.keyframeResolver ?.resume(), t$ = !0, tN(), tF(), t$ = !1), this._animation
            }
            get duration() {
                return this.animation.duration
            }
            get iterationDuration() {
                return this.animation.iterationDuration
            }
            get time() {
                return this.animation.time
            }
            set time(t) {
                this.animation.time = t
            }
            get speed() {
                return this.animation.speed
            }
            get state() {
                return this.animation.state
            }
            set speed(t) {
                this.animation.speed = t
            }
            get startTime() {
                return this.animation.startTime
            }
            attachTimeline(t) {
                return this._animation ? this.stopTimeline = this.animation.attachTimeline(t) : this.pendingTimeline = t, () => this.stop()
            }
            play() {
                this.animation.play()
            }
            pause() {
                this.animation.pause()
            }
            complete() {
                this.animation.complete()
            }
            cancel() {
                this._animation && this.animation.cancel(), this.keyframeResolver ?.cancel()
            }
        }
        let nO = {
                type: "spring",
                stiffness: 500,
                damping: 25,
                restSpeed: 10
            },
            n$ = {
                type: "keyframes",
                duration: .8
            },
            nF = {
                type: "keyframes",
                ease: [.25, .1, .35, 1],
                duration: .3
            },
            nN = new Set(["when", "delay", "delayChildren", "staggerChildren", "staggerDirection", "repeat", "repeatType", "repeatDelay", "from", "elapsed"]),
            n_ = (t, e, i, n = {}, r, s) => o => {
                let l = iY(n, t) || {},
                    u = l.delay || n.delay || 0,
                    {
                        elapsed: h = 0
                    } = n;
                h -= tz(u);
                let d = {
                    keyframes: Array.isArray(i) ? i : [null, i],
                    ease: "easeOut",
                    velocity: e.getVelocity(),
                    ...l,
                    delay: -h,
                    onUpdate: t => {
                        e.set(t), l.onUpdate && l.onUpdate(t)
                    },
                    onComplete: () => {
                        o(), l.onComplete && l.onComplete()
                    },
                    name: t,
                    motionValue: e,
                    element: s ? void 0 : r,
                    hasOnUpdate: !!l.onUpdate
                };
                ! function(t) {
                    for (let e in t)
                        if (!nN.has(e)) return !0;
                    return !1
                }(l) && Object.assign(d, ((t, {
                    keyframes: e
                }) => e.length > 2 ? n$ : a.has(t) ? t.startsWith("scale") ? {
                    type: "spring",
                    stiffness: 550,
                    damping: 0 === e[1] ? 2 * Math.sqrt(550) : 30,
                    restSpeed: 10
                } : nO : nF)(t, d)), d.duration && (d.duration = tz(d.duration)), d.repeatDelay && (d.repeatDelay = tz(d.repeatDelay)), void 0 !== d.from && (d.keyframes[0] = d.from);
                let c = !1;
                if (!1 !== d.type && (0 !== d.duration || d.repeatDelay) || (nY(d), 0 === d.delay && (c = !0)), (tY.instantAnimations || tY.skipAnimations || r ?.shouldSkipAnimations || l.skipAnimations) && (c = !0, nY(d), d.delay = 0), d.allowFlatten = !l.type && !l.ease, c && !s && void 0 !== e.get()) {
                    let t = t5(d.keyframes, l);
                    if (void 0 !== t) return void tR.update(() => {
                        d.onUpdate(t), d.onComplete()
                    })
                }
                return l.isSync ? new nP(d) : new nL(d)
            },
            nU = "u" > typeof window;

        function nW(t, e, {
            delay: i = 0,
            transitionOverride: n,
            type: r
        } = {}) {
            let {
                transition: s,
                transitionEnd: o,
                ...a
            } = e, l = t.getDefaultTransition();
            s = s ? iE(s, l) : l;
            let u = s ?.reduceMotion,
                h = s ?.skipAnimations;
            n && (s = n);
            let d = [],
                c = r && t.animationState ?.getState()[r],
                p = s ?.path;
            for (let e in p && p.animateVisualElement(t, a, s, i, d), a) {
                let n = t.getValue(e, t.latestValues[e] ?? null),
                    r = a[e];
                if (void 0 === r || c && function({
                        protectedKeys: t,
                        needsAnimating: e
                    }, i) {
                        let n = i in t && !e[i];
                        return e[i] = !1, n
                    }(c, e)) continue;
                let o = {
                    delay: i,
                    ...iY(s || {}, e)
                };
                h && (o.skipAnimations = !0);
                let l = n.get();
                if (void 0 !== l && !n.isAnimating() && !Array.isArray(r) && r === l && !o.velocity) {
                    tR.update(() => n.set(r));
                    continue
                }
                let p = !1;
                if (nU && window.MotionHandoffAnimation) {
                    let i = t.props[ib];
                    if (i) {
                        let t = window.MotionHandoffAnimation(i, e, tR);
                        null !== t && (o.startTime = t, p = !0)
                    }
                }
                ij(t, e);
                let m = u ?? t.shouldReduceMotion;
                n.start(n_(e, n, r, m && J.has(e) ? {
                    type: !1
                } : o, t, p));
                let f = n.animation;
                f && d.push(f)
            }
            if (o) {
                let e = () => tR.update(() => {
                    o && function(t, e) {
                        let {
                            transitionEnd: i = {},
                            transition: n = {},
                            ...r
                        } = iM(t, e) || {};
                        for (let e in r = { ...r,
                                ...i
                            }) {
                            var s;
                            let i = Array.isArray(s = r[e]) ? s[s.length - 1] || 0 : s;
                            t.hasValue(e) ? t.getValue(e).set(i) : t.addValue(e, ed(i))
                        }
                    }(t, o)
                });
                d.length ? Promise.all(d).then(e) : e()
            }
            return d
        }

        function nz(t, e, i, n = 0, r = 1) {
            let s = Array.from(t).sort((t, e) => t.sortNodePosition(e)).indexOf(e),
                o = t.size,
                a = (o - 1) * n;
            return "function" == typeof i ? i(s, o) : 1 === r ? s * n : a - s * n
        }

        function nH(t, e, i = {}) {
            let n = iM(t, e, iC(t, i.type)),
                r = i.transitionOverride || (n ?.transition ?? (t.getDefaultTransition() || {})),
                s = () => Promise.all(n ? nW(t, n, i) : []),
                o = (n = 0) => {
                    let {
                        variantChildren: s
                    } = t, {
                        delayChildren: o = 0,
                        staggerChildren: a,
                        staggerDirection: l
                    } = r, u = [];
                    return s ?.forEach(t => {
                        t.notify("AnimationStart", e), u.push(nH(t, e, { ...i,
                            delay: n + ("function" == typeof o ? 0 : o) + nz(s, t, o, a, l)
                        }).then(() => t.notify("AnimationComplete", e)))
                    }), Promise.all(u)
                },
                {
                    when: a
                } = r;
            return a ? "beforeChildren" === a ? s().then(() => o()) : o().then(s) : Promise.all([s(), o(i.delay)])
        }

        function nq(t, e) {
            if (!Array.isArray(e)) return !1;
            let i = e.length;
            if (i !== t.length) return !1;
            for (let n = 0; n < i; n++)
                if (e[n] !== t[n]) return !1;
            return !0
        }
        let nG = [...ef].reverse();

        function nK() {
            let t = {};
            for (let e of ef) t[e] = {
                isActive: "animate" === e,
                protectedKeys: {},
                needsAnimating: {},
                prevResolvedValues: {}
            };
            return t
        }
        let nZ = 0;

        function nJ(t) {
            return [t("x"), t("y")]
        }

        function nQ(t, e, i, n = {
            passive: !0
        }) {
            return t.addEventListener(e, i, n), () => t.removeEventListener(e, i, n)
        }
        let n0 = {
            x: !1,
            y: !1
        };

        function n1(t) {
            return t.max - t.min
        }

        function n5(t, e, i, n = .5) {
            t.origin = n, t.originPoint = ez(e.min, e.max, t.origin), t.scale = n1(i) / n1(e), t.translate = ez(i.min, i.max, t.origin) - t.originPoint, (t.scale >= .9999 && t.scale <= 1.0001 || isNaN(t.scale)) && (t.scale = 1), (t.translate >= -.01 && t.translate <= .01 || isNaN(t.translate)) && (t.translate = 0)
        }

        function n3(t, e, i, n) {
            n5(t.x, e.x, i.x, n ? n.originX : void 0), n5(t.y, e.y, i.y, n ? n.originY : void 0)
        }

        function n2(t, e, i, n = 0) {
            t.min = (n ? ez(i.min, i.max, n) : i.min) + e.min, t.max = t.min + n1(e)
        }

        function n4(t, e, i, n = 0) {
            let r = n ? ez(i.min, i.max, n) : i.min;
            t.min = e.min - r, t.max = t.min + n1(e)
        }

        function n8(t, e, i, n) {
            n4(t.x, e.x, i.x, n ?.x), n4(t.y, e.y, i.y, n ?.y)
        }
        let n6 = t => "object" == typeof t && null !== t;

        function n9(t) {
            return n6(t) && "ownerSVGElement" in t
        }

        function n7(t, e, i) {
            if (null == t) return [];
            if (t instanceof EventTarget) return [t];
            if ("string" == typeof t) {
                let n = document;
                e && (n = e.current);
                let r = i ?.[t] ?? n.querySelectorAll(t);
                return r ? Array.from(r) : []
            }
            return Array.from(t).filter(t => null != t)
        }
        let rt = new WeakMap,
            re = (t, e, i) => (n, r) => r && r[0] ? r[0][t + "Size"] : n9(n) && "getBBox" in n ? n.getBBox()[e] : n[i],
            ri = re("inline", "width", "offsetWidth"),
            rn = re("block", "height", "offsetHeight");

        function rr({
            target: t,
            borderBoxSize: e
        }) {
            rt.get(t) ?.forEach(i => {
                i(t, {
                    get width() {
                        return ri(t, e)
                    },
                    get height() {
                        return rn(t, e)
                    }
                })
            })
        }

        function rs(t) {
            t.forEach(rr)
        }
        let ro = new Set;

        function ra(t, e) {
            let r;
            return "function" == typeof t ? (ro.add(t), n || (n = () => {
                let t = {
                    get width() {
                        return window.innerWidth
                    },
                    get height() {
                        return window.innerHeight
                    }
                };
                ro.forEach(e => e(t))
            }, window.addEventListener("resize", n)), () => {
                ro.delete(t), ro.size || "function" != typeof n || (window.removeEventListener("resize", n), n = void 0)
            }) : (!i && "u" > typeof ResizeObserver && (i = new ResizeObserver(rs)), (r = n7(t)).forEach(t => {
                let n = rt.get(t);
                n || (n = new Set, rt.set(t, n)), n.add(e), i ?.observe(t)
            }), () => {
                r.forEach(t => {
                    let n = rt.get(t);
                    n ?.delete(e), n ?.size || i ?.unobserve(t)
                })
            })
        }
        let rl = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]),
            ru = new Set(["INPUT", "SELECT", "TEXTAREA"]),
            rh = t => "mouse" === t.pointerType ? "number" != typeof t.button || t.button <= 0 : !1 !== t.isPrimary;

        function rd(t) {
            return {
                point: {
                    x: t.pageX,
                    y: t.pageY
                }
            }
        }

        function rc(t, e, i, n) {
            return nQ(t, e, t => rh(t) && i(t, rd(t)), n)
        }
        let rp = ({
                current: t
            }) => t ? t.ownerDocument.defaultView : null,
            rm = (t, e) => Math.abs(t - e),
            rf = new Set(["auto", "scroll"]);
        class rg {
            constructor(t, e, {
                transformPagePoint: i,
                contextWindow: n = window,
                dragSnapToOrigin: r = !1,
                distanceThreshold: s = 3,
                element: o
            } = {}) {
                if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = new Map, this.removeScrollListeners = null, this.onElementScroll = t => {
                        this.handleScroll(t.target)
                    }, this.onWindowScroll = () => {
                        this.handleScroll(window)
                    }, this.updatePoint = () => {
                        var t, e;
                        if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
                        this.hasPendingMove = !1, this.lastRawMoveEventInfo && (this.lastMoveEventInfo = ry(this.lastRawMoveEventInfo, this.transformPagePoint));
                        let i = rx(this.lastMoveEventInfo, this.history),
                            n = null !== this.startEvent,
                            r = (t = i.offset, e = {
                                x: 0,
                                y: 0
                            }, Math.sqrt(rm(t.x, e.x) ** 2 + rm(t.y, e.y) ** 2) >= this.distanceThreshold);
                        if (!n && !r) return;
                        let {
                            point: s
                        } = i;
                        this.history.push({ ...s,
                            timestamp: t4.now()
                        });
                        let {
                            onStart: o,
                            onMove: a
                        } = this.handlers;
                        n || (o && o(this.lastMoveEvent, i), this.startEvent = this.lastMoveEvent), a && a(this.lastMoveEvent, i)
                    }, this.handlePointerMove = (t, e) => {
                        this.lastMoveEvent = t, this.lastRawMoveEventInfo = e, this.lastMoveEventInfo = ry(e, this.transformPagePoint), this.hasPendingMove = !0, tR.update(this.updatePoint, !0)
                    }, this.handlePointerUp = (t, e) => {
                        this.hasPendingMove && this.updatePoint(), this.end();
                        let {
                            onEnd: i,
                            onSessionEnd: n,
                            resumeAnimation: r
                        } = this.handlers;
                        if ((this.dragSnapToOrigin || !this.startEvent) && r && r(), !(this.lastMoveEvent && this.lastMoveEventInfo)) return;
                        let s = rx("pointercancel" === t.type ? this.lastMoveEventInfo : ry(e, this.transformPagePoint), this.history);
                        this.startEvent && i && i(t, s), n && n(t, s)
                    }, !rh(t)) return;
                this.dragSnapToOrigin = r, this.handlers = e, this.transformPagePoint = i, this.distanceThreshold = s, this.contextWindow = n || window;
                let a = ry(rd(t), this.transformPagePoint),
                    {
                        point: l
                    } = a,
                    {
                        timestamp: u
                    } = tI;
                this.history = [{ ...l,
                    timestamp: u
                }];
                let {
                    onSessionStart: h
                } = e;
                h && h(t, rx(a, this.history));
                let d = {
                    passive: !0,
                    capture: !0
                };
                this.removeListeners = iV(rc(this.contextWindow, "pointermove", this.handlePointerMove, d), rc(this.contextWindow, "pointerup", this.handlePointerUp, d), rc(this.contextWindow, "pointercancel", this.handlePointerUp, d)), o && this.startScrollTracking(o)
            }
            startScrollTracking(t) {
                let e = t.parentElement;
                for (; e;) {
                    let t = getComputedStyle(e);
                    (rf.has(t.overflowX) || rf.has(t.overflowY)) && this.scrollPositions.set(e, {
                        x: e.scrollLeft,
                        y: e.scrollTop
                    }), e = e.parentElement
                }
                this.scrollPositions.set(window, {
                    x: window.scrollX,
                    y: window.scrollY
                }), window.addEventListener("scroll", this.onElementScroll, {
                    capture: !0
                }), window.addEventListener("scroll", this.onWindowScroll), this.removeScrollListeners = () => {
                    window.removeEventListener("scroll", this.onElementScroll, {
                        capture: !0
                    }), window.removeEventListener("scroll", this.onWindowScroll)
                }
            }
            handleScroll(t) {
                let e = this.scrollPositions.get(t);
                if (!e) return;
                let i = t === window,
                    n = i ? {
                        x: window.scrollX,
                        y: window.scrollY
                    } : {
                        x: t.scrollLeft,
                        y: t.scrollTop
                    },
                    r = {
                        x: n.x - e.x,
                        y: n.y - e.y
                    };
                (0 !== r.x || 0 !== r.y) && (i ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += r.x, this.lastMoveEventInfo.point.y += r.y) : this.history.length > 0 && (this.history[0].x -= r.x, this.history[0].y -= r.y), this.scrollPositions.set(t, n), tR.update(this.updatePoint, !0))
            }
            updateHandlers(t) {
                this.handlers = t
            }
            end() {
                this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), tX(this.updatePoint)
            }
        }

        function ry(t, e) {
            return e ? {
                point: e(t.point)
            } : t
        }

        function rv(t, e) {
            return {
                x: t.x - e.x,
                y: t.y - e.y
            }
        }

        function rx({
            point: t
        }, e) {
            return {
                point: t,
                delta: rv(t, rw(e)),
                offset: rv(t, e[0]),
                velocity: function(t) {
                    if (t.length < 2) return {
                        x: 0,
                        y: 0
                    };
                    let e = t.length - 1,
                        i = null,
                        n = rw(t);
                    for (; e >= 0 && (i = t[e], !(n.timestamp - i.timestamp > tz(.1)));) e--;
                    if (!i) return {
                        x: 0,
                        y: 0
                    };
                    i === t[0] && t.length > 2 && n.timestamp - i.timestamp > 2 * tz(.1) && (i = t[1]);
                    let r = (n.timestamp - i.timestamp) / 1e3;
                    if (0 === r) return {
                        x: 0,
                        y: 0
                    };
                    let s = {
                        x: (n.x - i.x) / r,
                        y: (n.y - i.y) / r
                    };
                    return 1 / 0 === s.x && (s.x = 0), 1 / 0 === s.y && (s.y = 0), s
                }(e)
            }
        }

        function rw(t) {
            return t[t.length - 1]
        }

        function rb(t, e, i) {
            return {
                min: void 0 !== e ? t.min + e : void 0,
                max: void 0 !== i ? t.max + i - (t.max - t.min) : void 0
            }
        }

        function rT(t, e) {
            let i = e.min - t.min,
                n = e.max - t.max;
            return e.max - e.min < t.max - t.min && ([i, n] = [n, i]), {
                min: i,
                max: n
            }
        }

        function rk(t, e, i) {
            return {
                min: rS(t, e),
                max: rS(t, i)
            }
        }

        function rS(t, e) {
            return "number" == typeof t ? t : t[e] || 0
        }
        let rA = new WeakMap;
        class rP {
            constructor(t) {
                this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = {
                    x: 0,
                    y: 0
                }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = K(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = t
            }
            start(t, {
                snapToCursor: e = !1,
                distanceThreshold: i
            } = {}) {
                let {
                    presenceContext: n
                } = this.visualElement;
                if (n && !1 === n.isPresent) return;
                let r = t => {
                        e && this.snapToCursor(t), this.stopAnimation()
                    },
                    s = (t, e) => {
                        let {
                            drag: i,
                            dragPropagation: n,
                            onDragStart: r
                        } = this.getProps();
                        if (i && !n && (this.openDragLock && this.openDragLock(), this.openDragLock = function(t) {
                                if ("x" === t || "y" === t)
                                    if (n0[t]) return null;
                                    else return n0[t] = !0, () => {
                                        n0[t] = !1
                                    };
                                return n0.x || n0.y ? null : (n0.x = n0.y = !0, () => {
                                    n0.x = n0.y = !1
                                })
                            }(i), !this.openDragLock)) return;
                        this.latestPointerEvent = t, this.latestPanInfo = e, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), nJ(t => {
                            let e = this.getAxisMotionValue(t).get() || 0;
                            if (T.test(e)) {
                                let {
                                    projection: i
                                } = this.visualElement;
                                if (i && i.layout) {
                                    let n = i.layout.layoutBox[t];
                                    n && (e = n1(n) * (parseFloat(e) / 100))
                                }
                            }
                            this.originPoint[t] = e
                        }), r && tR.update(() => r(t, e), !1, !0), ij(this.visualElement, "transform");
                        let {
                            animationState: s
                        } = this.visualElement;
                        s && s.setActive("whileDrag", !0)
                    },
                    o = (t, e) => {
                        this.latestPointerEvent = t, this.latestPanInfo = e;
                        let {
                            dragPropagation: i,
                            dragDirectionLock: n,
                            onDirectionLock: r,
                            onDrag: s
                        } = this.getProps();
                        if (!i && !this.openDragLock) return;
                        let {
                            offset: o
                        } = e;
                        if (n && null === this.currentDirection) {
                            this.currentDirection = function(t, e = 10) {
                                let i = null;
                                return Math.abs(t.y) > e ? i = "y" : Math.abs(t.x) > e && (i = "x"), i
                            }(o), null !== this.currentDirection && r && r(this.currentDirection);
                            return
                        }
                        this.updateAxis("x", e.point, o), this.updateAxis("y", e.point, o), this.visualElement.render(), s && tR.update(() => s(t, e), !1, !0)
                    },
                    a = (t, e) => {
                        this.latestPointerEvent = t, this.latestPanInfo = e, this.stop(t, e), this.latestPointerEvent = null, this.latestPanInfo = null
                    },
                    l = () => {
                        let {
                            dragSnapToOrigin: t
                        } = this.getProps();
                        (t || this.constraints) && this.startAnimation({
                            x: 0,
                            y: 0
                        })
                    },
                    {
                        dragSnapToOrigin: u
                    } = this.getProps();
                this.panSession = new rg(t, {
                    onSessionStart: r,
                    onStart: s,
                    onMove: o,
                    onSessionEnd: a,
                    resumeAnimation: l
                }, {
                    transformPagePoint: this.visualElement.getTransformPagePoint(),
                    dragSnapToOrigin: u,
                    distanceThreshold: i,
                    contextWindow: rp(this.visualElement),
                    element: this.visualElement.current
                })
            }
            stop(t, e) {
                let i = t || this.latestPointerEvent,
                    n = e || this.latestPanInfo,
                    r = this.isDragging;
                if (this.cancel(), !r || !n || !i) return;
                let {
                    velocity: s
                } = n;
                this.startAnimation(s);
                let {
                    onDragEnd: o
                } = this.getProps();
                o && tR.postRender(() => o(i, n))
            }
            cancel() {
                this.isDragging = !1;
                let {
                    projection: t,
                    animationState: e
                } = this.visualElement;
                t && (t.isAnimationBlocked = !1), this.endPanSession();
                let {
                    dragPropagation: i
                } = this.getProps();
                !i && this.openDragLock && (this.openDragLock(), this.openDragLock = null), e && e.setActive("whileDrag", !1)
            }
            endPanSession() {
                this.panSession && this.panSession.end(), this.panSession = void 0
            }
            updateAxis(t, e, i) {
                let {
                    drag: n
                } = this.getProps();
                if (!i || !rC(t, n, this.currentDirection)) return;
                let r = this.getAxisMotionValue(t),
                    s = this.originPoint[t] + i[t];
                this.constraints && this.constraints[t] && (s = function(t, {
                    min: e,
                    max: i
                }, n) {
                    return void 0 !== e && t < e ? t = n ? ez(e, t, n.min) : Math.max(t, e) : void 0 !== i && t > i && (t = n ? ez(i, t, n.max) : Math.min(t, i)), t
                }(s, this.constraints[t], this.elastic[t])), r.set(s)
            }
            resolveConstraints() {
                let {
                    dragConstraints: t,
                    dragElastic: e
                } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : this.visualElement.projection ?.layout, n = this.constraints;
                t && ik(t) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : t && i ? this.constraints = function(t, {
                    top: e,
                    left: i,
                    bottom: n,
                    right: r
                }) {
                    return {
                        x: rb(t.x, i, r),
                        y: rb(t.y, e, n)
                    }
                }(i.layoutBox, t) : this.constraints = !1, this.elastic = function(t = .35) {
                    return !1 === t ? t = 0 : !0 === t && (t = .35), {
                        x: rk(t, "left", "right"),
                        y: rk(t, "top", "bottom")
                    }
                }(e), n !== this.constraints && !ik(t) && i && this.constraints && !this.hasMutatedConstraints && nJ(t => {
                    var e, n;
                    let r;
                    !1 !== this.constraints && this.getAxisMotionValue(t) && (this.constraints[t] = (e = i.layoutBox[t], n = this.constraints[t], r = {}, void 0 !== n.min && (r.min = n.min - e.min), void 0 !== n.max && (r.max = n.max - e.min), r))
                })
            }
            resolveRefConstraints() {
                var t;
                let {
                    dragConstraints: e,
                    onMeasureDragConstraints: i
                } = this.getProps();
                if (!e || !ik(e)) return !1;
                let n = e.current;
                ti();
                let {
                    projection: r
                } = this.visualElement;
                if (!r || !r.layout) return !1;
                r.root && (r.root.scroll = void 0, r.root.updateScroll());
                let s = function(t, e, i) {
                        let n = e2(t, i),
                            {
                                scroll: r
                            } = e;
                        return r && (e0(n.x, r.offset.x), e0(n.y, r.offset.y)), n
                    }(n, r.root, this.visualElement.getTransformPagePoint()),
                    o = (t = r.layout.layoutBox, {
                        x: rT(t.x, s.x),
                        y: rT(t.y, s.y)
                    });
                if (i) {
                    let t = i(function({
                        x: t,
                        y: e
                    }) {
                        return {
                            top: e.min,
                            right: t.max,
                            bottom: e.max,
                            left: t.min
                        }
                    }(o));
                    this.hasMutatedConstraints = !!t, t && (o = eW(t))
                }
                return o
            }
            startAnimation(t) {
                let {
                    drag: e,
                    dragMomentum: i,
                    dragElastic: n,
                    dragTransition: r,
                    dragSnapToOrigin: s,
                    onDragTransitionEnd: o
                } = this.getProps(), a = this.constraints || {};
                return Promise.all(nJ(o => {
                    if (!rC(o, e, this.currentDirection)) return;
                    let l = a && a[o] || {};
                    (!0 === s || s === o) && (l = {
                        min: 0,
                        max: 0
                    });
                    let u = {
                        type: "inertia",
                        velocity: i ? t[o] : 0,
                        bounceStiffness: n ? 200 : 1e6,
                        bounceDamping: n ? 40 : 1e7,
                        timeConstant: 750,
                        restDelta: 1,
                        restSpeed: 10,
                        ...r,
                        ...l
                    };
                    return this.startAxisValueAnimation(o, u)
                })).then(o)
            }
            startAxisValueAnimation(t, e) {
                let i = this.getAxisMotionValue(t);
                return ij(this.visualElement, t), i.start(n_(t, i, 0, e, this.visualElement, !1))
            }
            stopAnimation() {
                nJ(t => this.getAxisMotionValue(t).stop())
            }
            getAxisMotionValue(t) {
                let e = `_drag${t.toUpperCase()}`;
                return this.visualElement.getProps()[e] || this.visualElement.getValue(t, this.visualElement.latestValues[t] ?? 0)
            }
            snapToCursor({
                clientX: t,
                clientY: e
            }) {
                let {
                    drag: i
                } = this.getProps(), n = {
                    x: t,
                    y: e
                }, r = this.visualElement.getTransformPagePoint() ?.(n) || n, s = this.visualElement.measureViewportBox();
                nJ(t => {
                    if (!rC(t, i, this.currentDirection)) return;
                    let e = this.getAxisMotionValue(t),
                        {
                            min: n,
                            max: o
                        } = s[t];
                    e.set((e.get() || 0) + r[t] - ez(n, o, .5))
                })
            }
            scalePositionWithinConstraints() {
                if (!this.visualElement.current) return;
                let {
                    drag: t,
                    dragConstraints: e
                } = this.getProps(), {
                    projection: i
                } = this.visualElement;
                if (!ik(e) || !i || !this.constraints) return;
                this.stopAnimation();
                let n = this.constraints,
                    r = {
                        x: 0,
                        y: 0
                    };
                nJ(t => {
                    var e, i;
                    let s, o, a, u = this.getAxisMotionValue(t).get();
                    r[t] = (e = {
                        min: u,
                        max: u
                    }, i = n[t], s = .5, o = n1(e), (a = n1(i)) > o ? s = nf(i.min, i.max - o, e.min) : o > a && (s = nf(e.min, e.max - a, i.min)), l(0, 1, s))
                });
                let {
                    transformTemplate: s
                } = this.visualElement.getProps();
                this.visualElement.current.style.transform = s ? s({}, "") : "none", i.root && i.root.updateScroll(), i.updateLayout(), this.constraints = !1, this.resolveConstraints(), nJ(e => {
                    let i = this.getAxisMotionValue(e);
                    if (!rC(e, t, null) || !i.get()) return;
                    let {
                        min: n,
                        max: s
                    } = this.constraints[e];
                    i.set(ez(n, s, r[e]))
                }), this.visualElement.render()
            }
            addListeners() {
                let t;
                if (!this.visualElement.current) return;
                rA.set(this.visualElement, this);
                let e = this.visualElement.current,
                    i = rc(e, "pointerdown", t => {
                        let {
                            drag: i,
                            dragListener: n = !0
                        } = this.getProps(), r = t.target, s = r !== e && (ru.has(r.tagName) || !0 === r.isContentEditable);
                        i && n && !s && this.start(t)
                    }),
                    n = () => {
                        var i, n, r;
                        let s, o, {
                            dragConstraints: a
                        } = this.getProps();
                        ik(a) && a.current && (this.constraints = this.resolveRefConstraints(), t || (i = e, n = a.current, s = ra(i, rM(r = () => this.scalePositionWithinConstraints())), o = ra(n, rM(r)), t = () => {
                            s(), o()
                        }))
                    },
                    {
                        projection: r
                    } = this.visualElement,
                    s = r.addEventListener("measure", n);
                r && !r.layout && (r.root && r.root.updateScroll(), r.updateLayout()), tR.read(n);
                let o = nQ(window, "resize", () => this.scalePositionWithinConstraints()),
                    a = r.addEventListener("didUpdate", ({
                        delta: t,
                        hasLayoutChanged: e
                    }) => {
                        this.isDragging && e && (nJ(e => {
                            let i = this.getAxisMotionValue(e);
                            i && (this.originPoint[e] += t[e].translate, i.set(i.get() + t[e].translate))
                        }), this.visualElement.render())
                    });
                return () => {
                    o(), i(), s(), a && a(), t && t()
                }
            }
            getProps() {
                let t = this.visualElement.getProps(),
                    {
                        drag: e = !1,
                        dragDirectionLock: i = !1,
                        dragPropagation: n = !1,
                        dragConstraints: r = !1,
                        dragElastic: s = .35,
                        dragMomentum: o = !0
                    } = t;
                return { ...t,
                    drag: e,
                    dragDirectionLock: i,
                    dragPropagation: n,
                    dragConstraints: r,
                    dragElastic: s,
                    dragMomentum: o
                }
            }
        }

        function rM(t) {
            let e = !0;
            return () => {
                if (e) {
                    e = !1;
                    return
                }
                t()
            }
        }

        function rC(t, e, i) {
            return (!0 === e || e === t) && (null === i || i === t)
        }
        let rE = t => (e, i) => {
                t && tR.update(() => t(e, i), !1, !0)
            },
            rY = {
                hasAnimatedSinceResize: !0,
                hasEverUpdated: !1
            };
        var rj = s;
        let rV = !1;
        class rI extends rj.Component {
            componentDidMount() {
                let {
                    visualElement: t,
                    layoutGroup: e,
                    switchLayoutGroup: i,
                    layoutId: n
                } = this.props, {
                    projection: r
                } = t;
                r && (e.group && e.group.add(r), i && i.register && n && i.register(r), rV && r.root.didUpdate(), r.addEventListener("animationComplete", () => {
                    this.safeToRemove()
                }), r.setOptions({ ...r.options,
                    layoutDependency: this.props.layoutDependency,
                    onExitComplete: () => this.safeToRemove()
                })), rY.hasEverUpdated = !0
            }
            getSnapshotBeforeUpdate(t) {
                let {
                    layoutDependency: e,
                    visualElement: i,
                    drag: n,
                    isPresent: r
                } = this.props, {
                    projection: s
                } = i;
                return s && (s.isPresent = r, t.layoutDependency !== e && s.setOptions({ ...s.options,
                    layoutDependency: e
                }), rV = !0, n || t.layoutDependency !== e || void 0 === e || t.isPresent !== r ? s.willUpdate() : this.safeToRemove(), t.isPresent !== r && (r ? s.promote() : s.relegate() || tR.postRender(() => {
                    let t = s.getStack();
                    t && t.members.length || this.safeToRemove()
                }))), null
            }
            componentDidUpdate() {
                let {
                    visualElement: t,
                    layoutAnchor: e
                } = this.props, {
                    projection: i
                } = t;
                i && (i.options.layoutAnchor = e, i.root.didUpdate(), ea.postRender(() => {
                    !i.currentAnimation && i.isLead() && this.safeToRemove()
                }))
            }
            componentWillUnmount() {
                let {
                    visualElement: t,
                    layoutGroup: e,
                    switchLayoutGroup: i
                } = this.props, {
                    projection: n
                } = t;
                rV = !0, n && (n.scheduleCheckAfterUnmount(), e && e.group && e.group.remove(n), i && i.deregister && i.deregister(n))
            }
            safeToRemove() {
                let {
                    safeToRemove: t
                } = this.props;
                t && t()
            }
            render() {
                return null
            }
        }

        function rR(t) {
            let [e, i] = function(t = !0) {
                let e = (0, s.useContext)(id);
                if (null === e) return [!0, null];
                let {
                    isPresent: i,
                    onExitComplete: n,
                    register: r
                } = e, o = (0, s.useId)();
                (0, s.useEffect)(() => {
                    if (t) return r(o)
                }, [t]);
                let a = (0, s.useCallback)(() => t && n && n(o), [o, n, t]);
                return !i && n ? [!1, a] : [!0]
            }(), n = (0, rj.useContext)(e9);
            return (0, r.jsx)(rI, { ...t,
                layoutGroup: n,
                switchLayoutGroup: (0, rj.useContext)(iT),
                isPresent: e,
                safeToRemove: i
            })
        }

        function rX(t, e, i) {
            let n = Z(t) ? t : ed(t);
            return n.start(n_("", n, e, i)), n.animation
        }
        let rD = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
            rB = t => "number" == typeof t ? t : parseFloat(t),
            rL = rD.length,
            rO = t => "number" == typeof t || k.test(t);

        function r$(t, e) {
            return void 0 !== t[e] ? t[e] : t.borderRadius
        }
        let rF = r_(0, .5, nd),
            rN = r_(.5, .95, tE);

        function r_(t, e, i) {
            return n => n < t ? 0 : n > e ? 1 : i(nf(t, e, n))
        }

        function rU(t, e) {
            t.min = e.min, t.max = e.max
        }

        function rW(t, e) {
            rU(t.x, e.x), rU(t.y, e.y)
        }

        function rz(t, e) {
            t.translate = e.translate, t.scale = e.scale, t.originPoint = e.originPoint, t.origin = e.origin
        }

        function rH(t, e, i, n, r) {
            return t -= e, t = n + 1 / i * (t - n), void 0 !== r && (t = n + 1 / r * (t - n)), t
        }

        function rq(t, e, [i, n, r], s, o) {
            ! function(t, e = 0, i = 1, n = .5, r, s = t, o = t) {
                if (T.test(e) && (e = parseFloat(e), e = ez(o.min, o.max, e / 100) - o.min), "number" != typeof e) return;
                let a = ez(s.min, s.max, n);
                t === s && (a -= e), t.min = rH(t.min, e, i, a, r), t.max = rH(t.max, e, i, a, r)
            }(t, e[i], e[n], e[r], e.scale, s, o)
        }
        let rG = ["x", "scaleX", "originX"],
            rK = ["y", "scaleY", "originY"];

        function rZ(t, e, i, n) {
            rq(t.x, e, rG, i ? i.x : void 0, n ? n.x : void 0), rq(t.y, e, rK, i ? i.y : void 0, n ? n.y : void 0)
        }

        function rJ(t) {
            return 0 === t.translate && 1 === t.scale
        }

        function rQ(t) {
            return rJ(t.x) && rJ(t.y)
        }

        function r0(t, e) {
            return t.min === e.min && t.max === e.max
        }

        function r1(t, e) {
            return Math.round(t.min) === Math.round(e.min) && Math.round(t.max) === Math.round(e.max)
        }

        function r5(t, e) {
            return r1(t.x, e.x) && r1(t.y, e.y)
        }

        function r3(t) {
            return n1(t.x) / n1(t.y)
        }

        function r2(t, e) {
            return t.translate === e.translate && t.scale === e.scale && t.originPoint === e.originPoint
        }
        class r4 {
            constructor() {
                this.members = []
            }
            add(t) {
                tH(this.members, t);
                for (let e = this.members.length - 1; e >= 0; e--) {
                    let i = this.members[e];
                    if (i === t || i === this.lead || i === this.prevLead) continue;
                    let n = i.instance;
                    n && !1 !== n.isConnected || i.snapshot || (tq(this.members, i), i.unmount())
                }
                t.scheduleRender()
            }
            remove(t) {
                if (tq(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
                    let t = this.members[this.members.length - 1];
                    t && this.promote(t)
                }
            }
            relegate(t) {
                for (let e = this.members.indexOf(t) - 1; e >= 0; e--) {
                    let t = this.members[e];
                    if (!1 !== t.isPresent && t.instance ?.isConnected !== !1) return this.promote(t), !0
                }
                return !1
            }
            promote(t, e) {
                let i = this.lead;
                if (t !== i && (this.prevLead = i, this.lead = t, t.show(), i)) {
                    i.updateSnapshot(), t.scheduleRender();
                    let {
                        layoutDependency: n
                    } = i.options, {
                        layoutDependency: r
                    } = t.options;
                    (void 0 === n || n !== r) && (t.resumeFrom = i, e && (i.preserveOpacity = !0), i.snapshot && (t.snapshot = i.snapshot, t.snapshot.latestValues = i.animationValues || i.latestValues), t.root ?.isUpdating && (t.isLayoutDirty = !0)), !1 === t.options.crossfade && i.hide()
                }
            }
            exitAnimationComplete() {
                this.members.forEach(t => {
                    t.options.onExitComplete ?.(), t.resumingFrom ?.options.onExitComplete ?.()
                })
            }
            scheduleRender() {
                this.members.forEach(t => t.instance && t.scheduleRender(!1))
            }
            removeLeadSnapshot() {
                this.lead ?.snapshot && (this.lead.snapshot = void 0)
            }
        }

        function r8(t, e) {
            return e.max === e.min ? 0 : t / (e.max - e.min) * 100
        }
        let r6 = {
                correct: (t, e) => {
                    if (!e.target) return t;
                    if ("string" == typeof t)
                        if (!k.test(t)) return t;
                        else t = parseFloat(t);
                    let i = r8(t, e.target.x),
                        n = r8(t, e.target.y);
                    return `${i}% ${n}%`
                }
            },
            r9 = {
                borderRadius: { ...r6,
                    applyTo: [...rD]
                },
                borderTopLeftRadius: r6,
                borderTopRightRadius: r6,
                borderBottomLeftRadius: r6,
                borderBottomRightRadius: r6,
                boxShadow: {
                    correct: (t, {
                        treeScale: e,
                        projectionDelta: i
                    }) => {
                        let n = D.parse(t);
                        if (n.length > 5) return t;
                        let r = D.createTransformer(t),
                            s = +("number" != typeof n[0]),
                            o = i.x.scale * e.x,
                            a = i.y.scale * e.y;
                        n[0 + s] /= o, n[1 + s] /= a;
                        let l = ez(o, a, .5);
                        return "number" == typeof n[2 + s] && (n[2 + s] /= l), "number" == typeof n[3 + s] && (n[3 + s] /= l), r(n)
                    }
                }
            },
            r7 = (t, e) => t.depth - e.depth;
        class st {
            constructor() {
                this.children = [], this.isDirty = !1
            }
            add(t) {
                tH(this.children, t), this.isDirty = !0
            }
            remove(t) {
                tq(this.children, t), this.isDirty = !0
            }
            forEach(t) {
                this.isDirty && this.children.sort(r7), this.isDirty = !1, this.children.forEach(t)
            }
        }
        Object.assign(e$, { ...r9,
            ...e$
        });
        let se = ["", "X", "Y", "Z"],
            si = 0;

        function sn(t, e, i, n) {
            let {
                latestValues: r
            } = e;
            r[t] && (i[t] = r[t], e.setStaticValue(t, 0), n && (n[t] = 0))
        }
        let sr = ({
            instance: t
        }) => t && eo.get(t) ?.demote();

        function ss({
            attachResizeListener: t,
            defaultParent: e,
            measureScroll: i,
            checkIsScrollRoot: n,
            resetTransform: r
        }) {
            return class {
                constructor(t = {}, i = e ?.()) {
                    this.id = si++, this.animationId = 0, this.animationCommitId = 0, this.children = new Set, this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = {
                        x: 1,
                        y: 1
                    }, this.eventHandlers = new Map, this.hasTreeAnimated = !1, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
                        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots())
                    }, this.updateProjection = () => {
                        this.projectionUpdateScheduled = !1, this.nodes.forEach(sl), this.nodes.forEach(sv), this.nodes.forEach(sx), this.nodes.forEach(su)
                    }, this.resolvedRelativeTargetAt = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = new Map, this.latestValues = t, this.root = i ? i.root || i : this, this.path = i ? [...i.path, i] : [], this.parent = i, this.depth = i ? i.depth + 1 : 0;
                    for (let t = 0; t < this.path.length; t++) this.path[t].shouldResetTransform = !0;
                    this.root === this && (this.nodes = new st)
                }
                addEventListener(t, e) {
                    return this.eventHandlers.has(t) || this.eventHandlers.set(t, new tG), this.eventHandlers.get(t).add(e)
                }
                notifyListeners(t, ...e) {
                    let i = this.eventHandlers.get(t);
                    i && i.notify(...e)
                }
                hasListeners(t) {
                    return this.eventHandlers.has(t)
                }
                mount(e) {
                    if (this.instance) return;
                    this.isSVG = n9(e) && !(n9(e) && "svg" === e.tagName), this.instance = e;
                    let {
                        layoutId: i,
                        layout: n,
                        visualElement: r
                    } = this.options;
                    if (r && !r.current && r.mount(e), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (n || i) && (this.isLayoutDirty = !0), t) {
                        let i, n = 0,
                            r = () => this.root.updateBlockedByResize = !1;
                        tR.read(() => {
                            n = window.innerWidth
                        }), t(e, () => {
                            let t = window.innerWidth;
                            if (t !== n) {
                                let e, s;
                                n = t, this.root.updateBlockedByResize = !0, i && i(), e = t4.now(), s = ({
                                    timestamp: t
                                }) => {
                                    let i = t - e;
                                    i >= 250 && (tX(s), r())
                                }, tR.setup(s, !0), i = () => tX(s), rY.hasAnimatedSinceResize && (rY.hasAnimatedSinceResize = !1, this.nodes.forEach(sy))
                            }
                        })
                    }
                    i && this.root.registerSharedNode(i, this), !1 !== this.options.animate && r && (i || n) && this.addEventListener("didUpdate", ({
                        delta: t,
                        hasLayoutChanged: e,
                        hasRelativeLayoutChanged: i,
                        layout: n
                    }) => {
                        if (this.isAnimationBlocked) {
                            this.target = void 0, this.relativeTarget = void 0;
                            return
                        }
                        let s = this.options.transition || r.getDefaultTransition() || sA,
                            {
                                onLayoutAnimationStart: o,
                                onLayoutAnimationComplete: a
                            } = r.getProps(),
                            l = !this.targetLayout || !r5(this.targetLayout, n),
                            u = !e && i;
                        if (this.options.layoutRoot || this.resumeFrom || u || e && (l || !this.currentAnimation)) {
                            this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
                            let e = { ...iY(s, "layout"),
                                onPlay: o,
                                onComplete: a
                            };
                            (r.shouldReduceMotion || this.options.layoutRoot) && (e.delay = 0, e.type = !1), this.startAnimation(e), this.setAnimationOrigin(t, u, e.path)
                        } else e || sy(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
                        this.targetLayout = n
                    })
                }
                unmount() {
                    this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
                    let t = this.getStack();
                    t && t.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), tX(this.updateProjection)
                }
                blockUpdate() {
                    this.updateManuallyBlocked = !0
                }
                unblockUpdate() {
                    this.updateManuallyBlocked = !1
                }
                isUpdateBlocked() {
                    return this.updateManuallyBlocked || this.updateBlockedByResize
                }
                startUpdate() {
                    !this.isUpdateBlocked() && (this.isUpdating = !0, this.nodes && this.nodes.forEach(sw), this.animationId++)
                }
                getTransformTemplate() {
                    let {
                        visualElement: t
                    } = this.options;
                    return t && t.getProps().transformTemplate
                }
                willUpdate(t = !0) {
                    if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
                        this.options.onExitComplete && this.options.onExitComplete();
                        return
                    }
                    if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && function t(e) {
                            if (e.hasCheckedOptimisedAppear = !0, e.root === e) return;
                            let {
                                visualElement: i
                            } = e.options;
                            if (!i) return;
                            let n = i.props[ib];
                            if (window.MotionHasOptimisedAnimation(n, "transform")) {
                                let {
                                    layout: t,
                                    layoutId: i
                                } = e.options;
                                window.MotionCancelOptimisedAnimation(n, "transform", tR, !(t || i))
                            }
                            let {
                                parent: r
                            } = e;
                            r && !r.hasCheckedOptimisedAppear && t(r)
                        }(this), this.root.isUpdating || this.root.startUpdate(), this.isLayoutDirty) return;
                    sr(this), this.isLayoutDirty = !0;
                    for (let t = 0; t < this.path.length; t++) {
                        let e = this.path[t];
                        e.shouldResetTransform = !0, sr(e), ("string" == typeof e.latestValues.x || "string" == typeof e.latestValues.y) && (e.isLayoutDirty = !0), e.updateScroll("snapshot"), e.options.layoutRoot && e.willUpdate(!1), e.isAnimationBlocked && (e.dragSnapshot || (e.dragSnapshot = e.measure()), this.dragAncestor = e)
                    }
                    let {
                        layoutId: e,
                        layout: i
                    } = this.options;
                    if (void 0 === e && !i) return;
                    let n = this.getTransformTemplate();
                    this.prevTransformTemplateValue = n ? n(this.latestValues, "") : void 0, this.updateSnapshot(), t && this.notifyListeners("willUpdate")
                }
                update() {
                    if (this.updateScheduled = !1, this.isUpdateBlocked()) {
                        let t = this.updateBlockedByResize;
                        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), t && this.nodes.forEach(sc), this.nodes.forEach(sd);
                        return
                    }
                    if (this.animationId <= this.animationCommitId) return void this.nodes.forEach(sp);
                    this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(sm), this.nodes.forEach(sf), this.nodes.forEach(sg), this.nodes.forEach(so), this.nodes.forEach(sa)) : this.nodes.forEach(sp), this.clearAllSnapshots();
                    let t = t4.now();
                    tI.delta = l(0, 1e3 / 60, t - tI.timestamp), tI.timestamp = t, tI.isProcessing = !0, tD.update.process(tI), tD.preRender.process(tI), tD.render.process(tI), tI.isProcessing = !1
                }
                didUpdate() {
                    this.updateScheduled || (this.updateScheduled = !0, ea.read(this.scheduleUpdate))
                }
                clearAllSnapshots() {
                    this.nodes.forEach(sh), this.sharedNodes.forEach(sb)
                }
                scheduleUpdateProjection() {
                    this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, tR.preRender(this.updateProjection, !1, !0))
                }
                scheduleCheckAfterUnmount() {
                    tR.postRender(() => {
                        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed()
                    })
                }
                updateSnapshot() {
                    !this.snapshot && this.instance && (this.snapshot = this.measure(), !this.snapshot || n1(this.snapshot.measuredBox.x) || n1(this.snapshot.measuredBox.y) || (this.snapshot = void 0))
                }
                updateLayout() {
                    if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty)) return;
                    if (this.resumeFrom && !this.resumeFrom.instance)
                        for (let t = 0; t < this.path.length; t++) this.path[t].updateScroll();
                    let t = this.layout;
                    this.layout = this.measure(!1), this.layoutCorrected || (this.layoutCorrected = K()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
                    let {
                        visualElement: e
                    } = this.options;
                    e && e.notify("LayoutMeasure", this.layout.layoutBox, t ? t.layoutBox : void 0)
                }
                updateScroll(t = "measure") {
                    let e = !!(this.options.layoutScroll && this.instance);
                    if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === t && (e = !1), e && this.instance) {
                        let e = n(this.instance);
                        this.scroll = {
                            animationId: this.root.animationId,
                            phase: t,
                            isRoot: e,
                            offset: i(this.instance),
                            wasRoot: this.scroll ? this.scroll.isRoot : e
                        }
                    }
                }
                resetTransform() {
                    if (!r) return;
                    let t = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout;
                    t && sr(this);
                    let e = this.projectionDelta && !rQ(this.projectionDelta),
                        i = this.getTransformTemplate(),
                        n = i ? i(this.latestValues, "") : void 0,
                        s = n !== this.prevTransformTemplateValue;
                    t && this.instance && (e || eG(this.latestValues) || s) && (r(this.instance, n), this.shouldResetTransform = !1, this.scheduleRender())
                }
                measure(t = !0) {
                    var e;
                    let i = this.measurePageBox(),
                        n = this.removeElementScroll(i);
                    return t && (n = this.removeTransform(n)), sC((e = n).x), sC(e.y), {
                        animationId: this.root.animationId,
                        measuredBox: i,
                        layoutBox: n,
                        latestValues: {},
                        source: this.id
                    }
                }
                measurePageBox() {
                    let {
                        visualElement: t
                    } = this.options;
                    if (!t) return K();
                    let e = t.measureViewportBox();
                    if (!(this.scroll ?.wasRoot || this.path.some(sY))) {
                        let {
                            scroll: t
                        } = this.root;
                        t && (e0(e.x, t.offset.x), e0(e.y, t.offset.y))
                    }
                    return e
                }
                removeElementScroll(t) {
                    let e = K();
                    if (rW(e, t), this.scroll ?.wasRoot) return e;
                    for (let i = 0; i < this.path.length; i++) {
                        let n = this.path[i],
                            {
                                scroll: r,
                                options: s
                            } = n;
                        n !== this.root && r && s.layoutScroll && (r.wasRoot && rW(e, t), e0(e.x, r.offset.x), e0(e.y, r.offset.y))
                    }
                    return e
                }
                applyTransform(t, e = !1, i) {
                    let n = i || K();
                    rW(n, t);
                    for (let t = 0; t < this.path.length; t++) {
                        let i = this.path[t];
                        !e && i.options.layoutScroll && i.scroll && i !== i.root && (e0(n.x, -i.scroll.offset.x), e0(n.y, -i.scroll.offset.y)), eG(i.latestValues) && e3(n, i.latestValues, i.layout ?.layoutBox)
                    }
                    return eG(this.latestValues) && e3(n, this.latestValues, this.layout ?.layoutBox), n
                }
                removeTransform(t) {
                    let e = K();
                    rW(e, t);
                    for (let t = 0; t < this.path.length; t++) {
                        let i, n = this.path[t];
                        eG(n.latestValues) && (n.instance && (eq(n.latestValues) && n.updateSnapshot(), rW(i = K(), n.measurePageBox())), rZ(e, n.latestValues, n.snapshot ?.layoutBox, i))
                    }
                    return eG(this.latestValues) && rZ(e, this.latestValues), e
                }
                setTargetDelta(t) {
                    this.targetDelta = t, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0
                }
                setOptions(t) {
                    this.options = { ...this.options,
                        ...t,
                        crossfade: void 0 === t.crossfade || t.crossfade
                    }
                }
                clearMeasurements() {
                    this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1
                }
                forceRelativeParentToResolveTarget() {
                    this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== tI.timestamp && this.relativeParent.resolveTargetDelta(!0)
                }
                resolveTargetDelta(t = !1) {
                    let e = this.getLead();
                    this.isProjectionDirty || (this.isProjectionDirty = e.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = e.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = e.isSharedProjectionDirty);
                    let i = !!this.resumingFrom || this !== e;
                    if (!(t || i && this.isSharedProjectionDirty || this.isProjectionDirty || this.parent ?.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize)) return;
                    let {
                        layout: n,
                        layoutId: r
                    } = this.options;
                    if (!this.layout || !(n || r)) return;
                    this.resolvedRelativeTargetAt = tI.timestamp;
                    let s = this.getClosestProjectingParent();
                    if (this.targetDelta || this.relativeTarget || (!1 !== this.options.layoutAnchor && s && s.layout ? this.createRelativeTarget(s, this.layout.layoutBox, s.layout.layoutBox) : this.removeRelativeTarget()), this.relativeTarget || this.targetDelta) {
                        if (this.target || (this.target = K(), this.targetWithTransforms = K()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target) {
                            var o, a, l, u;
                            this.forceRelativeParentToResolveTarget(), o = this.target, a = this.relativeTarget, l = this.relativeParent.target, u = this.options.layoutAnchor || void 0, n2(o.x, a.x, l.x, u ?.x), n2(o.y, a.y, l.y, u ?.y)
                        } else this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : rW(this.target, this.layout.layoutBox), eQ(this.target, this.targetDelta)) : rW(this.target, this.layout.layoutBox);
                        this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, !1 !== this.options.layoutAnchor && s && !!s.resumingFrom == !!this.resumingFrom && !s.options.layoutScroll && s.target && 1 !== this.animationProgress ? this.createRelativeTarget(s, this.target, s.target) : this.relativeParent = this.relativeTarget = void 0)
                    }
                }
                getClosestProjectingParent() {
                    if (!(!this.parent || eq(this.parent.latestValues) || eK(this.parent.latestValues)))
                        if (this.parent.isProjecting()) return this.parent;
                        else return this.parent.getClosestProjectingParent()
                }
                isProjecting() {
                    return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout)
                }
                createRelativeTarget(t, e, i) {
                    this.relativeParent = t, this.forceRelativeParentToResolveTarget(), this.relativeTarget = K(), this.relativeTargetOrigin = K(), n8(this.relativeTargetOrigin, e, i, this.options.layoutAnchor || void 0), rW(this.relativeTarget, this.relativeTargetOrigin)
                }
                removeRelativeTarget() {
                    this.relativeParent = this.relativeTarget = void 0
                }
                calcProjection() {
                    let t = this.getLead(),
                        e = !!this.resumingFrom || this !== t,
                        i = !0;
                    if ((this.isProjectionDirty || this.parent ?.isProjectionDirty) && (i = !1), e && (this.isSharedProjectionDirty || this.isTransformDirty) && (i = !1), this.resolvedRelativeTargetAt === tI.timestamp && (i = !1), i) return;
                    let {
                        layout: n,
                        layoutId: r
                    } = this.options;
                    if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(n || r)) return;
                    rW(this.layoutCorrected, this.layout.layoutBox);
                    let s = this.treeScale.x,
                        o = this.treeScale.y;
                    ! function(t, e, i, n = !1) {
                        let r, s, o = i.length;
                        if (o) {
                            e.x = e.y = 1;
                            for (let a = 0; a < o; a++) {
                                s = (r = i[a]).projectionDelta;
                                let {
                                    visualElement: o
                                } = r.options;
                                (!o || !o.props.style || "contents" !== o.props.style.display) && (n && r.options.layoutScroll && r.scroll && r !== r.root && (e0(t.x, -r.scroll.offset.x), e0(t.y, -r.scroll.offset.y)), s && (e.x *= s.x.scale, e.y *= s.y.scale, eQ(t, s)), n && eG(r.latestValues) && e3(t, r.latestValues, r.layout ?.layoutBox))
                            }
                            e.x < 1.0000000000001 && e.x > .999999999999 && (e.x = 1), e.y < 1.0000000000001 && e.y > .999999999999 && (e.y = 1)
                        }
                    }(this.layoutCorrected, this.treeScale, this.path, e), t.layout && !t.target && (1 !== this.treeScale.x || 1 !== this.treeScale.y) && (t.target = t.layout.layoutBox, t.targetWithTransforms = K());
                    let {
                        target: a
                    } = t;
                    if (!a) {
                        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
                        return
                    }
                    this.projectionDelta && this.prevProjectionDelta ? (rz(this.prevProjectionDelta.x, this.projectionDelta.x), rz(this.prevProjectionDelta.y, this.projectionDelta.y)) : this.createProjectionDeltas(), n3(this.projectionDelta, this.layoutCorrected, a, this.latestValues), this.treeScale.x === s && this.treeScale.y === o && r2(this.projectionDelta.x, this.prevProjectionDelta.x) && r2(this.projectionDelta.y, this.prevProjectionDelta.y) || (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", a))
                }
                hide() {
                    this.isVisible = !1
                }
                show() {
                    this.isVisible = !0
                }
                scheduleRender(t = !0) {
                    if (this.options.visualElement ?.scheduleRender(), t) {
                        let t = this.getStack();
                        t && t.scheduleRender()
                    }
                    this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0)
                }
                createProjectionDeltas() {
                    this.prevProjectionDelta = q(), this.projectionDelta = q(), this.projectionDeltaWithTransform = q()
                }
                setAnimationOrigin(t, e = !1, i) {
                    let n, r = this.snapshot,
                        s = r ? r.latestValues : {},
                        o = { ...this.latestValues
                        },
                        a = q();
                    this.relativeParent && this.relativeParent.options.layoutRoot || (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !e;
                    let l = K(),
                        u = (r ? r.source : void 0) !== (this.layout ? this.layout.source : void 0),
                        h = this.getStack(),
                        d = !h || h.members.length <= 1,
                        c = !!(u && !d && !0 === this.options.crossfade && !this.path.some(sS));
                    this.animationProgress = 0;
                    let p = i ?.interpolateProjection(t);
                    this.mixTargetDelta = e => {
                        let i = e / 1e3,
                            r = p ?.(i);
                        if (r ? (a.x.translate = r.x, a.x.scale = ez(t.x.scale, 1, i), a.x.origin = t.x.origin, a.x.originPoint = t.x.originPoint, a.y.translate = r.y, a.y.scale = ez(t.y.scale, 1, i), a.y.origin = t.y.origin, a.y.originPoint = t.y.originPoint) : (sT(a.x, t.x, i), sT(a.y, t.y, i)), this.setTargetDelta(a), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout) {
                            var h, m, f, g, y, v;
                            n8(l, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), f = this.relativeTarget, g = this.relativeTargetOrigin, y = l, v = i, sk(f.x, g.x, y.x, v), sk(f.y, g.y, y.y, v), n && (h = this.relativeTarget, m = n, r0(h.x, m.x) && r0(h.y, m.y)) && (this.isProjectionDirty = !1), n || (n = K()), rW(n, this.relativeTarget)
                        }
                        u && (this.animationValues = o, function(t, e, i, n, r, s) {
                            r ? (t.opacity = ez(0, i.opacity ?? 1, rF(n)), t.opacityExit = ez(e.opacity ?? 1, 0, rN(n))) : s && (t.opacity = ez(e.opacity ?? 1, i.opacity ?? 1, n));
                            for (let r = 0; r < rL; r++) {
                                let s = rD[r],
                                    o = r$(e, s),
                                    a = r$(i, s);
                                (void 0 !== o || void 0 !== a) && (o || (o = 0), a || (a = 0), 0 === o || 0 === a || rO(o) === rO(a) ? (t[s] = Math.max(ez(rB(o), rB(a), n), 0), (T.test(a) || T.test(o)) && (t[s] += "%")) : t[s] = a)
                            }(e.rotate || i.rotate) && (t.rotate = ez(e.rotate || 0, i.rotate || 0, n))
                        }(o, s, this.latestValues, i, c, d)), r && void 0 !== r.rotate && (this.animationValues || (this.animationValues = o), this.animationValues.pathRotation = r.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = i
                    }, this.mixTargetDelta(1e3 * !!this.options.layoutRoot)
                }
                startAnimation(t) {
                    this.notifyListeners("animationStart"), this.currentAnimation ?.stop(), this.resumingFrom ?.currentAnimation ?.stop(), this.pendingAnimation && (tX(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = tR.update(() => {
                        rY.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = ed(0)), this.motionValue.jump(0, !1), this.currentAnimation = rX(this.motionValue, [0, 1e3], { ...t,
                                velocity: 0,
                                isSync: !0,
                                onUpdate: e => {
                                    this.mixTargetDelta(e), t.onUpdate && t.onUpdate(e)
                                },
                                onComplete: () => {
                                    t.onComplete && t.onComplete(), this.completeAnimation()
                                }
                            }),
                            function(t, e) {
                                let i = globalThis.__MOTION_INSPECT__;
                                if (i) try {
                                    i({ ...t8("layout-animation-start", t),
                                        node: e
                                    })
                                } catch {}
                            }(this.currentAnimation, this), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0
                    })
                }
                completeAnimation() {
                    this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
                    let t = this.getStack();
                    t && t.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete")
                }
                finishAnimation() {
                    this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(1e3), this.currentAnimation.stop()), this.completeAnimation()
                }
                applyTransformsToTarget() {
                    let t = this.getLead(),
                        {
                            targetWithTransforms: e,
                            layout: i,
                            latestValues: n
                        } = t,
                        {
                            target: r
                        } = t;
                    if (e && r && i) {
                        if (this !== t && this.layout && i && sE(this.options.animationType, this.layout.layoutBox, i.layoutBox)) {
                            r = this.target || K();
                            let e = n1(this.layout.layoutBox.x);
                            r.x.min = t.target.x.min, r.x.max = r.x.min + e;
                            let i = n1(this.layout.layoutBox.y);
                            r.y.min = t.target.y.min, r.y.max = r.y.min + i
                        }
                        rW(e, r), e3(e, n), n3(this.projectionDeltaWithTransform, this.layoutCorrected, e, n)
                    }
                }
                registerSharedNode(t, e) {
                    this.sharedNodes.has(t) || this.sharedNodes.set(t, new r4), this.sharedNodes.get(t).add(e);
                    let i = e.options.initialPromotionConfig;
                    e.promote({
                        transition: i ? i.transition : void 0,
                        preserveFollowOpacity: i && i.shouldPreserveFollowOpacity ? i.shouldPreserveFollowOpacity(e) : void 0
                    })
                }
                isLead() {
                    let t = this.getStack();
                    return !t || t.lead === this
                }
                getLead() {
                    let {
                        layoutId: t
                    } = this.options;
                    return t && this.getStack() ?.lead || this
                }
                getPrevLead() {
                    let {
                        layoutId: t
                    } = this.options;
                    return t ? this.getStack() ?.prevLead : void 0
                }
                getStack() {
                    let {
                        layoutId: t
                    } = this.options;
                    if (t) return this.root.sharedNodes.get(t)
                }
                promote({
                    needsReset: t,
                    transition: e,
                    preserveFollowOpacity: i
                } = {}) {
                    let n = this.getStack();
                    n && n.promote(this, i), t && (this.projectionDelta = void 0, this.needsReset = !0), e && this.setOptions({
                        transition: e
                    })
                }
                relegate() {
                    let t = this.getStack();
                    return !!t && t.relegate(this)
                }
                resetSkewAndRotation() {
                    let {
                        visualElement: t
                    } = this.options;
                    if (!t) return;
                    let e = !1,
                        {
                            latestValues: i
                        } = t;
                    if ((i.z || i.rotate || i.rotateX || i.rotateY || i.rotateZ || i.skewX || i.skewY) && (e = !0), !e) return;
                    let n = {};
                    i.z && sn("z", t, n, this.animationValues);
                    for (let e = 0; e < se.length; e++) sn(`rotate${se[e]}`, t, n, this.animationValues), sn(`skew${se[e]}`, t, n, this.animationValues);
                    for (let e in t.render(), n) t.setStaticValue(e, n[e]), this.animationValues && (this.animationValues[e] = n[e]);
                    t.scheduleRender()
                }
                applyProjectionStyles(t, e) {
                    if (!this.instance || this.isSVG) return;
                    if (!this.isVisible) {
                        t.visibility = "hidden";
                        return
                    }
                    let i = this.getTransformTemplate();
                    if (this.needsReset) {
                        this.needsReset = !1, t.visibility = "", t.opacity = "", t.pointerEvents = iu(e ?.pointerEvents) || "", t.transform = i ? i(this.latestValues, "") : "none";
                        return
                    }
                    let n = this.getLead();
                    if (!this.projectionDelta || !this.layout || !n.target) {
                        this.options.layoutId && (t.opacity = void 0 !== this.latestValues.opacity ? this.latestValues.opacity : 1, t.pointerEvents = iu(e ?.pointerEvents) || ""), this.hasProjected && !eG(this.latestValues) && (t.transform = i ? i({}, "") : "none", this.hasProjected = !1);
                        return
                    }
                    t.visibility = "";
                    let r = n.animationValues || n.latestValues;
                    this.applyTransformsToTarget();
                    let s = function(t, e, i) {
                        let n = "",
                            r = t.x.translate / e.x,
                            s = t.y.translate / e.y,
                            o = i ?.z || 0;
                        if ((r || s || o) && (n = `translate3d(${r}px, ${s}px, ${o}px) `), (1 !== e.x || 1 !== e.y) && (n += `scale(${1/e.x}, ${1/e.y}) `), i) {
                            let {
                                transformPerspective: t,
                                rotate: e,
                                pathRotation: r,
                                rotateX: s,
                                rotateY: o,
                                skewX: a,
                                skewY: l
                            } = i;
                            t && (n = `perspective(${t}px) ${n}`), e && (n += `rotate(${e}deg) `), r && (n += `rotate(${r}deg) `), s && (n += `rotateX(${s}deg) `), o && (n += `rotateY(${o}deg) `), a && (n += `skewX(${a}deg) `), l && (n += `skewY(${l}deg) `)
                        }
                        let a = t.x.scale * e.x,
                            l = t.y.scale * e.y;
                        return (1 !== a || 1 !== l) && (n += `scale(${a}, ${l})`), n || "none"
                    }(this.projectionDeltaWithTransform, this.treeScale, r);
                    i && (s = i(r, s)), t.transform = s;
                    let {
                        x: o,
                        y: a
                    } = this.projectionDelta;
                    for (let e in t.transformOrigin = `${100*o.origin}% ${100*a.origin}% 0`, n.animationValues ? t.opacity = n === this ? r.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : r.opacityExit : t.opacity = n === this ? void 0 !== r.opacity ? r.opacity : "" : void 0 !== r.opacityExit ? r.opacityExit : 0, e$) {
                        if (void 0 === r[e]) continue;
                        let {
                            correct: i,
                            applyTo: o,
                            isCSSVariable: a
                        } = e$[e], l = "none" === s ? r[e] : i(r[e], n);
                        if (o) {
                            let e = o.length;
                            for (let i = 0; i < e; i++) t[o[i]] = l
                        } else a ? this.options.visualElement.renderState.vars[e] = l : t[e] = l
                    }
                    this.options.layoutId && (t.pointerEvents = n === this ? iu(e ?.pointerEvents) || "" : "none")
                }
                clearSnapshot() {
                    this.resumeFrom = this.snapshot = this.dragSnapshot = this.dragAncestor = void 0
                }
                resetTree() {
                    this.root.nodes.forEach(t => t.currentAnimation ?.stop()), this.root.nodes.forEach(sd), this.root.sharedNodes.clear()
                }
            }
        }

        function so(t) {
            t.updateLayout(),
                function(t) {
                    let {
                        snapshot: e,
                        dragAncestor: i
                    } = t, n = i ?.layout;
                    if (!e || !n || t.resumeFrom || t.isAnimationBlocked) return;
                    let r = i.dragSnapshot;
                    nJ(t => e0(e.layoutBox[t], n.layoutBox[t].min - r.layoutBox[t].min))
                }(t)
        }

        function sa(t) {
            let e = t.resumeFrom ?.snapshot || t.snapshot;
            if (t.isLead() && t.layout && e && t.hasListeners("didUpdate")) {
                let {
                    layoutBox: i,
                    measuredBox: n
                } = t.layout, {
                    animationType: r
                } = t.options, s = e.source !== t.layout.source;
                if ("size" === r) nJ(t => {
                    let n = s ? e.measuredBox[t] : e.layoutBox[t],
                        r = n1(n);
                    n.min = i[t].min, n.max = n.min + r
                });
                else if ("x" === r || "y" === r) {
                    let t = "x" === r ? "y" : "x";
                    rU(s ? e.measuredBox[t] : e.layoutBox[t], i[t])
                } else sE(r, e.layoutBox, i) && nJ(n => {
                    let r = s ? e.measuredBox[n] : e.layoutBox[n],
                        o = n1(i[n]);
                    r.max = r.min + o, t.relativeTarget && !t.currentAnimation && (t.isProjectionDirty = !0, t.relativeTarget[n].max = t.relativeTarget[n].min + o)
                });
                let o = q();
                n3(o, i, e.layoutBox);
                let a = q();
                s ? n3(a, t.applyTransform(n, !0), e.measuredBox) : n3(a, i, e.layoutBox);
                let l = !rQ(o),
                    u = !1;
                if (!t.resumeFrom) {
                    let n = t.getClosestProjectingParent();
                    if (n && !n.resumeFrom) {
                        let {
                            snapshot: r,
                            layout: s
                        } = n;
                        if (r && s) {
                            let o = t.options.layoutAnchor || void 0,
                                a = K();
                            n8(a, e.layoutBox, r.layoutBox, o);
                            let l = K();
                            n8(l, i, s.layoutBox, o), r5(a, l) || (u = !0), n.options.layoutRoot && (t.relativeTarget = l, t.relativeTargetOrigin = a, t.relativeParent = n)
                        }
                    }
                }
                t.notifyListeners("didUpdate", {
                    layout: i,
                    snapshot: e,
                    delta: a,
                    layoutDelta: o,
                    hasLayoutChanged: l,
                    hasRelativeLayoutChanged: u
                })
            } else if (t.isLead()) {
                let {
                    onExitComplete: e
                } = t.options;
                e && e()
            }
            t.options.transition = void 0
        }

        function sl(t) {
            t.parent && (t.isProjecting() || (t.isProjectionDirty = t.parent.isProjectionDirty), t.isSharedProjectionDirty || (t.isSharedProjectionDirty = !!(t.isProjectionDirty || t.parent.isProjectionDirty || t.parent.isSharedProjectionDirty)), t.isTransformDirty || (t.isTransformDirty = t.parent.isTransformDirty))
        }

        function su(t) {
            t.isProjectionDirty = t.isSharedProjectionDirty = t.isTransformDirty = !1
        }

        function sh(t) {
            t.clearSnapshot()
        }

        function sd(t) {
            t.clearMeasurements()
        }

        function sc(t) {
            t.isLayoutDirty = !0, t.updateLayout()
        }

        function sp(t) {
            t.isLayoutDirty = !1
        }

        function sm(t) {
            t.isAnimationBlocked && t.layout && !t.isLayoutDirty && (t.snapshot = t.dragSnapshot || t.layout, t.isLayoutDirty = !0)
        }

        function sf(t) {
            t.relativeTarget && t.relativeParent ?.isLayoutDirty && (t.currentAnimation ? t.isLayoutDirty = !0 : (t.targetDelta = void 0, t.removeRelativeTarget()))
        }

        function sg(t) {
            let {
                visualElement: e
            } = t.options;
            e && e.getProps().onBeforeLayoutMeasure && e.notify("BeforeLayoutMeasure"), t.resetTransform()
        }

        function sy(t) {
            t.finishAnimation(), t.targetDelta = t.relativeTarget = t.target = void 0, t.isProjectionDirty = !0
        }

        function sv(t) {
            t.resolveTargetDelta()
        }

        function sx(t) {
            t.calcProjection()
        }

        function sw(t) {
            t.resetSkewAndRotation()
        }

        function sb(t) {
            t.removeLeadSnapshot()
        }

        function sT(t, e, i) {
            t.translate = ez(e.translate, 0, i), t.scale = ez(e.scale, 1, i), t.origin = e.origin, t.originPoint = e.originPoint
        }

        function sk(t, e, i, n) {
            t.min = ez(e.min, i.min, n), t.max = ez(e.max, i.max, n)
        }

        function sS(t) {
            return t.animationValues && void 0 !== t.animationValues.opacityExit
        }
        let sA = {
                duration: .45,
                ease: [.4, 0, .1, 1]
            },
            sP = t => "u" > typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().includes(t),
            sM = sP("applewebkit/") && !sP("chrome/") ? Math.round : tE;

        function sC(t) {
            t.min = sM(t.min), t.max = sM(t.max)
        }

        function sE(t, e, i) {
            return "position" === t || "preserve-aspect" === t && !(.2 >= Math.abs(r3(e) - r3(i)))
        }

        function sY(t) {
            return t !== t.root && t.scroll ?.wasRoot
        }
        let sj = ss({
                attachResizeListener: (t, e) => nQ(t, "resize", e),
                measureScroll: () => ({
                    x: document.documentElement.scrollLeft || document.body ?.scrollLeft || 0,
                    y: document.documentElement.scrollTop || document.body ?.scrollTop || 0
                }),
                checkIsScrollRoot: () => !0
            }),
            sV = {
                current: void 0
            },
            sI = ss({
                measureScroll: t => ({
                    x: t.scrollLeft,
                    y: t.scrollTop
                }),
                defaultParent: () => {
                    if (!sV.current) {
                        let t = new sj({});
                        t.mount(window), t.setOptions({
                            layoutScroll: !0
                        }), sV.current = t
                    }
                    return sV.current
                },
                resetTransform: (t, e) => {
                    t.style.transform = void 0 !== e ? e : "none"
                },
                checkIsScrollRoot: t => "fixed" === window.getComputedStyle(t).position
            });

        function sR(t, e) {
            let i = n7(t),
                n = new AbortController;
            return [i, {
                passive: !0,
                ...e,
                signal: n.signal
            }, () => n.abort()]
        }

        function sX(t, e, i) {
            let {
                props: n
            } = t;
            t.animationState && n.whileHover && t.animationState.setActive("whileHover", "Start" === i);
            let r = n["onHover" + i];
            r && tR.postRender(() => r(e, rd(e)))
        }

        function sD(t) {
            return n6(t) && "offsetHeight" in t && !("ownerSVGElement" in t)
        }
        let sB = (t, e) => !!e && (t === e || sB(t, e.parentElement)),
            sL = new WeakSet;

        function sO(t) {
            return e => {
                "Enter" === e.key && t(e)
            }
        }

        function s$(t, e) {
            t.dispatchEvent(new PointerEvent("pointer" + e, {
                isPrimary: !0,
                bubbles: !0
            }))
        }

        function sF(t) {
            return rh(t) && !(n0.x || n0.y)
        }
        let sN = new WeakSet;

        function s_(t, e, i) {
            let {
                props: n
            } = t;
            if (t.current instanceof HTMLButtonElement && t.current.disabled) return;
            t.animationState && n.whileTap && t.animationState.setActive("whileTap", "Start" === i);
            let r = n["onTap" + ("End" === i ? "" : i)];
            r && tR.postRender(() => r(e, rd(e)))
        }
        let sU = new WeakMap,
            sW = new WeakMap,
            sz = t => {
                let e = sU.get(t.target);
                e && e(t)
            },
            sH = t => {
                t.forEach(sz)
            },
            sq = {
                some: 0,
                all: 1
            },
            sG = function(t, e) {
                if ("u" < typeof Proxy) return iA;
                let i = new Map,
                    n = (i, n) => iA(i, n, t, e);
                return new Proxy((t, e) => n(t, e), {
                    get: (r, s) => "create" === s ? n : (i.has(s) || i.set(s, iA(s, void 0, t, e)), i.get(s))
                })
            }({
                animation: {
                    Feature: class extends iP {
                        constructor(t) {
                            super(t), t.animationState || (t.animationState = function(t) {
                                let e = e => Promise.all(e.map(({
                                        animation: e,
                                        options: i
                                    }) => (function(t, e, i = {}) {
                                        return t.notify("AnimationStart", e), (Array.isArray(e) ? Promise.all(e.map(e => nH(t, e, i))) : "string" == typeof e ? nH(t, e, i) : Promise.all(nW(t, iM(t, e, i.custom), i))).then(() => {
                                            t.notify("AnimationComplete", e)
                                        })
                                    })(t, e, i))),
                                    i = nK(),
                                    n = !0,
                                    r = !1;

                                function s(s) {
                                    let {
                                        props: o,
                                        parent: a,
                                        manuallyAnimateOnMount: l
                                    } = t, u = n || r, h = [], d = new Set, c = {}, p = 1 / 0, m = t;
                                    do m = !1 !== m.props.inherit && m.parent; while (m && !m.isControllingVariants) if (nG.forEach((e, n) => {
                                            var r, f;
                                            let g = i[e],
                                                y = o[e],
                                                v = m && m.props[e],
                                                x = void 0 !== y ? y : em(v) || !1 === v ? v : void 0,
                                                w = em(x),
                                                b = e === s ? g.isActive : null;
                                            !1 === b && (p = n);
                                            let T = w && void 0 === y && !(u && l);
                                            if (g.protectedKeys = { ...c
                                                }, !g.isActive && null === b || !x && !g.prevProp || ep(x) || "boolean" == typeof x) return;
                                            if ("exit" === e && g.isActive && !0 !== b) {
                                                c = { ...c,
                                                    ...g.prevResolvedValues
                                                };
                                                return
                                            }
                                            let k = (r = g.prevProp, "string" == typeof(f = x) ? f !== r : !!Array.isArray(f) && !nq(f, r)),
                                                S = k || w && (b && !T || n > p),
                                                A = !1,
                                                P = Array.isArray(x) ? x : [x],
                                                M = {};
                                            if (!1 !== b)
                                                for (let i of P) {
                                                    let {
                                                        transition: n,
                                                        transitionEnd: r,
                                                        ...s
                                                    } = iM(t, i, iC(t, e)) || {};
                                                    M = { ...M,
                                                        ...s,
                                                        ...r
                                                    }
                                                }
                                            let {
                                                prevResolvedValues: C
                                            } = g;
                                            for (let e in { ...C,
                                                    ...M
                                                }) {
                                                if (e in c) continue;
                                                let i = M[e],
                                                    n = C[e],
                                                    r = Array.isArray(i) && Array.isArray(n) ? !nq(i, n) || k : i !== n;
                                                if (r && null == i) d.add(e);
                                                else if (r || void 0 !== i && d.has(e)) {
                                                    S = !0, d.delete(e) && (A = !0), g.needsAnimating[e] = !0;
                                                    let i = t.getValue(e);
                                                    i && (i.liveStyle = !1)
                                                } else g.protectedKeys[e] = !0
                                            }
                                            if (g.prevProp = x, g.prevResolvedValues = M, g.isActive && (c = { ...c,
                                                    ...M
                                                }), S && (!(T && k) || A))
                                                for (let i of P) {
                                                    let n = {
                                                        type: e
                                                    };
                                                    if ("string" == typeof i && u && l && a ?.enteringChildren) {
                                                        let e = iM(a, i) ?.transition ?.delayChildren;
                                                        n.delay = nz(a.enteringChildren, t, e)
                                                    }
                                                    h.push({
                                                        animation: i,
                                                        options: n
                                                    })
                                                }
                                        }), d.size) {
                                        let {
                                            initial: e
                                        } = o, i = {}, n = "boolean" != typeof e && iM(t, Array.isArray(e) ? e[0] : e, t.presenceContext ?.custom);
                                        n && n.transition && (i.transition = n.transition), d.forEach(r => {
                                            let s = t.getValue(r);
                                            s && (s.liveStyle = !0);
                                            let a = n && !Array.isArray(e) ? n[r] : void 0,
                                                l = t.getBaseTargetFromProps(o, r);
                                            i[r] = (void 0 !== a ? a : void 0 === l || Z(l) ? void 0 === t.initialValues[r] ? t.baseTarget[r] : void 0 : l) ?? null
                                        }), h.push({
                                            animation: i
                                        })
                                    }
                                    let f = u && t.blockInitialAnimation || n && !l && (!1 === o.initial || o.initial === o.animate);
                                    return n = r = !1, !f && h.length ? e(h) : Promise.resolve()
                                }
                                return {
                                    animateChanges: s,
                                    setActive: function(e, n) {
                                        if (i[e].isActive === n) return Promise.resolve();
                                        t.variantChildren ?.forEach(t => t.animationState ?.setActive(e, n)), i[e].isActive = n;
                                        let r = s(e);
                                        for (let t in i) i[t].protectedKeys = {};
                                        return r
                                    },
                                    setAnimateFunction: i => {
                                        e = i(t)
                                    },
                                    getState: () => i,
                                    reset: () => {
                                        i = nK(), r = !0
                                    }
                                }
                            }(t))
                        }
                        updateAnimationControlsSubscription() {
                            let {
                                animate: t
                            } = this.node.getProps();
                            ep(t) && (this.unmountControls = t.subscribe(this.node))
                        }
                        mount() {
                            this.updateAnimationControlsSubscription()
                        }
                        update() {
                            let {
                                animate: t
                            } = this.node.getProps(), {
                                animate: e
                            } = this.node.prevProps || {};
                            t !== e && this.updateAnimationControlsSubscription()
                        }
                        unmount() {
                            this.node.animationState.reset(), this.unmountControls ?.()
                        }
                    }
                },
                exit: {
                    Feature: class extends iP {
                        constructor() {
                            super(...arguments), this.id = nZ++
                        }
                        update() {
                            let {
                                presenceContext: t,
                                prevPresenceContext: e,
                                animationState: i
                            } = this.node;
                            if (!t || !i) return;
                            let {
                                isPresent: n,
                                onExitComplete: r
                            } = t, s = e ?.isPresent;
                            if (n === s) return;
                            if (n && !1 === s) {
                                if (!0 === this.exit) {
                                    let {
                                        initial: t
                                    } = this.node.getProps();
                                    if (t && !Array.isArray(t)) {
                                        let {
                                            transition: e,
                                            transitionEnd: i,
                                            ...n
                                        } = iM(this.node, t) || {};
                                        for (let t in n) this.node.getValue(t) ?.jump(n[t])
                                    }
                                    this.node.blockInitialAnimation = !1, i.reset(), i.animateChanges()
                                } else i.setActive("exit", !1);
                                this.exit = void 0;
                                return
                            }
                            let o = this.exit = i.setActive("exit", !n);
                            r && !n && o.then(() => {
                                this.exit === o && (this.exit = !0, r(this.id))
                            })
                        }
                        mount() {
                            let {
                                register: t,
                                onExitComplete: e
                            } = this.node.presenceContext || {};
                            e && e(this.id), t && (this.unmount = t(this.id))
                        }
                        unmount() {}
                    }
                },
                inView: {
                    Feature: class extends iP {
                        constructor() {
                            super(...arguments), this.hasEnteredView = !1, this.isInView = !1
                        }
                        startObserver() {
                            var t;
                            let e;
                            this.stopObserver ?.();
                            let {
                                viewport: i = {}
                            } = this.node.getProps(), {
                                root: n,
                                margin: r,
                                amount: s = "some",
                                once: o
                            } = i, a = {
                                root: n ? n.current : void 0,
                                rootMargin: r,
                                threshold: "number" == typeof s ? s : sq[s]
                            }, l = t => {
                                let {
                                    isIntersecting: e
                                } = t;
                                if (this.isInView === e || (this.isInView = e, o && !e && this.hasEnteredView)) return;
                                e && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", e);
                                let {
                                    onViewportEnter: i,
                                    onViewportLeave: n
                                } = this.node.getProps(), r = e ? i : n;
                                r && r(t)
                            };
                            this.stopObserver = (t = this.node.current, e = function({
                                root: t,
                                ...e
                            }) {
                                let i = t || document;
                                sW.has(i) || sW.set(i, {});
                                let n = sW.get(i),
                                    r = JSON.stringify(e);
                                return n[r] || (n[r] = new IntersectionObserver(sH, {
                                    root: t,
                                    ...e
                                })), n[r]
                            }(a), sU.set(t, l), e.observe(t), () => {
                                sU.delete(t), e.unobserve(t)
                            })
                        }
                        mount() {
                            this.startObserver()
                        }
                        update() {
                            if ("u" < typeof IntersectionObserver) return;
                            let {
                                props: t,
                                prevProps: e
                            } = this.node;
                            ["amount", "margin", "root"].some(function({
                                viewport: t = {}
                            }, {
                                viewport: e = {}
                            } = {}) {
                                return i => t[i] !== e[i]
                            }(t, e)) && this.startObserver()
                        }
                        unmount() {
                            this.stopObserver ?.(), this.hasEnteredView = !1, this.isInView = !1
                        }
                    }
                },
                tap: {
                    Feature: class extends iP {
                        mount() {
                            let {
                                current: t
                            } = this.node;
                            if (!t) return;
                            let {
                                globalTapTarget: e,
                                propagate: i
                            } = this.node.props;
                            this.unmount = function(t, e, i = {}) {
                                let [n, r, s] = sR(t, i), o = t => {
                                    let n = t.currentTarget;
                                    if (!sF(t) || sN.has(t)) return;
                                    sL.add(n), i.stopPropagation && sN.add(t);
                                    let s = e(n, t),
                                        o = { ...r,
                                            capture: !0
                                        },
                                        a = (t, e) => {
                                            window.removeEventListener("pointerup", l, o), window.removeEventListener("pointercancel", u, o), sL.has(n) && sL.delete(n), sF(t) && "function" == typeof s && s(t, {
                                                success: e
                                            })
                                        },
                                        l = t => {
                                            a(t, n === window || n === document || i.useGlobalTarget || sB(n, t.target))
                                        },
                                        u = t => {
                                            a(t, !1)
                                        };
                                    window.addEventListener("pointerup", l, o), window.addEventListener("pointercancel", u, o)
                                };
                                return n.forEach(t => {
                                    ((i.useGlobalTarget ? window : t).addEventListener("pointerdown", o, r), sD(t)) && (t.addEventListener("focus", t => ((t, e) => {
                                        let i = t.currentTarget;
                                        if (!i) return;
                                        let n = sO(() => {
                                            if (sL.has(i)) return;
                                            s$(i, "down");
                                            let t = sO(() => {
                                                s$(i, "up")
                                            });
                                            i.addEventListener("keyup", t, e), i.addEventListener("blur", () => s$(i, "cancel"), e)
                                        });
                                        i.addEventListener("keydown", n, e), i.addEventListener("blur", () => i.removeEventListener("keydown", n), e)
                                    })(t, r)), rl.has(t.tagName) || !0 === t.isContentEditable || t.hasAttribute("tabindex") || (t.tabIndex = 0))
                                }), s
                            }(t, (t, e) => (s_(this.node, e, "Start"), (t, {
                                success: e
                            }) => s_(this.node, t, e ? "End" : "Cancel")), {
                                useGlobalTarget: e,
                                stopPropagation: i ?.tap === !1
                            })
                        }
                        unmount() {}
                    }
                },
                focus: {
                    Feature: class extends iP {
                        constructor() {
                            super(...arguments), this.isActive = !1
                        }
                        onFocus() {
                            let t = !1;
                            try {
                                t = this.node.current.matches(":focus-visible")
                            } catch (e) {
                                t = !0
                            }
                            t && this.node.animationState && (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0)
                        }
                        onBlur() {
                            this.isActive && this.node.animationState && (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1)
                        }
                        mount() {
                            this.unmount = iV(nQ(this.node.current, "focus", () => this.onFocus()), nQ(this.node.current, "blur", () => this.onBlur()))
                        }
                        unmount() {}
                    }
                },
                hover: {
                    Feature: class extends iP {
                        mount() {
                            let {
                                current: t
                            } = this.node;
                            t && (this.unmount = function(t, e, i = {}) {
                                let [n, r, s] = sR(t, i);
                                return n.forEach(t => {
                                    let i, n = !1,
                                        s = !1,
                                        o = e => {
                                            i && (i(e), i = void 0), t.removeEventListener("pointerleave", l)
                                        },
                                        a = t => {
                                            n = !1, window.removeEventListener("pointerup", a), window.removeEventListener("pointercancel", a), s && (s = !1, o(t))
                                        },
                                        l = t => {
                                            if ("touch" !== t.pointerType) {
                                                if (n) {
                                                    s = !0;
                                                    return
                                                }
                                                o(t)
                                            }
                                        };
                                    t.addEventListener("pointerenter", n => {
                                        if ("touch" === n.pointerType || n0.x || n0.y) return;
                                        s = !1;
                                        let o = e(t, n);
                                        "function" == typeof o && (i = o, t.addEventListener("pointerleave", l, r))
                                    }, r), t.addEventListener("pointerdown", () => {
                                        n = !0, window.addEventListener("pointerup", a, r), window.addEventListener("pointercancel", a, r)
                                    }, r)
                                }), s
                            }(t, (t, e) => (sX(this.node, e, "Start"), t => sX(this.node, t, "End"))))
                        }
                        unmount() {}
                    }
                },
                pan: {
                    Feature: class extends iP {
                        constructor() {
                            super(...arguments), this.removePointerDownListener = tE
                        }
                        onPointerDown(t) {
                            this.session = new rg(t, this.createPanHandlers(), {
                                transformPagePoint: this.node.getTransformPagePoint(),
                                contextWindow: rp(this.node)
                            })
                        }
                        createPanHandlers() {
                            let {
                                onPanSessionStart: t,
                                onPanStart: e,
                                onPan: i,
                                onPanEnd: n
                            } = this.node.getProps();
                            return {
                                onSessionStart: rE(t),
                                onStart: rE(e),
                                onMove: rE(i),
                                onEnd: (t, e) => {
                                    delete this.session, n && tR.postRender(() => n(t, e))
                                }
                            }
                        }
                        mount() {
                            this.removePointerDownListener = rc(this.node.current, "pointerdown", t => this.onPointerDown(t))
                        }
                        update() {
                            this.session && this.session.updateHandlers(this.createPanHandlers())
                        }
                        unmount() {
                            this.removePointerDownListener(), this.session && this.session.end()
                        }
                    }
                },
                drag: {
                    Feature: class extends iP {
                        constructor(t) {
                            super(t), this.removeGroupControls = tE, this.removeListeners = tE, this.controls = new rP(t)
                        }
                        mount() {
                            let {
                                dragControls: t
                            } = this.node.getProps();
                            t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || tE
                        }
                        update() {
                            let {
                                dragControls: t
                            } = this.node.getProps(), {
                                dragControls: e
                            } = this.node.prevProps || {};
                            t !== e && (this.removeGroupControls(), t && (this.removeGroupControls = t.subscribe(this.controls)))
                        }
                        unmount() {
                            this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession()
                        }
                    },
                    ProjectionNode: sI,
                    MeasureLayout: rR
                },
                layout: {
                    ProjectionNode: sI,
                    MeasureLayout: rR
                }
            }, (t, e) => e.isSVG ?? e6(t) ? new eU(e) : new e4(e, {
                allowProjection: t !== s.Fragment
            }));
        var sK = t.i(85437),
            sK = sK;
        let sZ = "text-[12px] font-medium uppercase tracking-[0.08em] text-ink",
            sJ = "transition-opacity duration-300";

        function sQ({
            focus: t = !1,
            onClose: e
        }) {
            let i = t ? "pointer-events-none opacity-0" : "opacity-100";
            return (0, r.jsxs)("header", {
                className: "absolute inset-x-0 top-0 z-50 grid h-[10.4vh] min-h-[64px] grid-cols-[1fr_auto_1fr] items-center px-[2.2vw]",
                children: [(0, r.jsx)("a", {
                    href: "#about",
                    className: `${sZ} ${sJ} ${i} justify-self-start`,
                    tabIndex: t ? -1 : void 0,
                    children: "About"
                }), (0, r.jsx)(sK.Image, {
                    src: (typeof window !== "undefined" && window.__DB_SETTINGS__ && window.__DB_SETTINGS__.logo_url) ? window.__DB_SETTINGS__.logo_url : "/snug-wrld-logo.png",
                    width: 134,
                    height: 72,
                    alt: "Store Logo",
                    preload: !0,
                    className: `${sJ} ${i}`,
                    style: {
                        height: (typeof window !== "undefined" && window.__DB_SETTINGS__ && window.__DB_SETTINGS__.logo_height) ? (parseInt(window.__DB_SETTINGS__.logo_height) || 36) : 36,
                        width: (typeof window !== "undefined" && window.__DB_SETTINGS__ && window.__DB_SETTINGS__.logo_width && window.__DB_SETTINGS__.logo_width !== "auto") ? (parseInt(window.__DB_SETTINGS__.logo_width) || "auto") : "auto"
                    }
                }), (0, r.jsxs)("div", {
                    className: "relative justify-self-end",
                    children: [(0, r.jsx)("a", {
                        href: "#contact",
                        className: `${sZ} ${sJ} ${i} block`,
                        tabIndex: t ? -1 : void 0,
                        children: "Contact"
                    }), (0, r.jsxs)("button", {
                        type: "button",
                        onClick: e,
                        className: `${sZ} ${sJ} absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-[10px] whitespace-nowrap ${t?"opacity-100":"pointer-events-none opacity-0"}`,
                        tabIndex: t ? void 0 : -1,
                        "aria-hidden": !t,
                        "aria-label": "Close detail view",
                        style: {
                            minHeight: 48,
                            minWidth: 48,
                            justifyContent: "flex-end"
                        },
                        children: ["Close ", (0, r.jsx)("span", {
                            "aria-hidden": "true",
                            className: "text-[13px] font-semibold",
                            children: "✕"
                        })]
                    })]
                })]
            })
        }

        function s0() {
            let t = "IT'S US, NEVER THEM  •  NEW DROPS  •  LAGOS  •  ".repeat(8);
            return (0, r.jsx)("div", {
                className: "absolute inset-x-0 bottom-0 z-30 flex h-[4.3vh] min-h-[32px] items-center overflow-hidden bg-brand text-[14px] font-bold uppercase italic tracking-[0.06em] text-brand-ink",
                "aria-label": "It's us, never them. New drops. Lagos.",
                children: (0, r.jsxs)("div", {
                    className: "marquee-track",
                    "aria-hidden": "true",
                    children: [(0, r.jsx)("span", {
                        children: t
                    }), (0, r.jsx)("span", {
                        children: t
                    })]
                })
            })
        }

        function s1() {
            return null
        }

        function s5({
            className: t,
            style: e
        }) {
            return (0, r.jsxs)("div", {
                className: `rail ${t??""}`,
                style: e,
                "aria-hidden": "true",
                children: [(0, r.jsx)("div", {
                    className: "rail-tube"
                }), (0, r.jsxs)("div", {
                    className: "rail-end l",
                    children: [(0, r.jsx)("div", {
                        className: "rail-plate"
                    }), (0, r.jsx)("div", {
                        className: "rail-cap"
                    })]
                }), (0, r.jsxs)("div", {
                    className: "rail-end r",
                    children: [(0, r.jsx)("div", {
                        className: "rail-plate"
                    }), (0, r.jsx)("div", {
                        className: "rail-cap"
                    })]
                })]
            })
        }

        function s3(t) {
            let e = ic(() => ed(t)),
                {
                    isStatic: i
                } = (0, s.useContext)(it);
            if (i) {
                let [, i] = (0, s.useState)(t);
                (0, s.useEffect)(() => e.on("change", i), [])
            }
            return e
        }

        function s2(t, e) {
            let i = s3(e()),
                n = () => i.set(e());
            return n(), iS(() => {
                let e = () => tR.preRender(n, !1, !0),
                    i = t.map(t => t.on("change", e));
                return n(), () => {
                    i.forEach(t => t()), tX(n)
                }
            }), i
        }

        function s4(t, ...e) {
            let i = t.length;
            return s2(e.filter(Z), function() {
                let n = "";
                for (let r = 0; r < i; r++) {
                    n += t[r];
                    let i = e[r];
                    i && (n += Z(i) ? i.get() : i)
                }
                return n
            })
        }

        function s8() {
            ew.current || eT();
            let [t] = (0, s.useState)(ex.current);
            return t
        }
        let s6 = new Set,
            s9 = ({
                timestamp: t
            }) => {
                s6.forEach(e => e.tick(t))
            };
        class s7 extends t3 {
            constructor(t) {
                super(), this.state = "idle", this.startTime = 0, this.currentTime = 0, this.started = !1, this.hasNextTarget = !1, this.nextTarget = 0, this.stop = () => {
                    "idle" !== this.state && (this.teardown(), this.options.onStop ?.())
                }, this.options = t, this.factory = t.type, this.generator = this.factory(t);
                let {
                    driver: e
                } = t;
                e && (this.driver = e(t => this.tick(t))), this.startTime = this.now(), this.state = "running", this.driver ? this.driver.start() : (s6.size || tR.update(s9, !0), s6.add(this))
            }
            setTarget(t, e) {
                this.nextTarget = t, this.nextVelocity = e, this.hasNextTarget = !0
            }
            retarget(t, e) {
                let {
                    options: i,
                    generator: n
                } = this;
                i.keyframes = t, i.velocity = e, this.startTime = this.now(), this.currentTime = 0, n.retarget ? n.retarget(t, e) : this.generator = this.factory(i)
            }
            tick(t) {
                let {
                    options: e,
                    hasNextTarget: i
                } = this, {
                    delay: n = 0,
                    onUpdate: r,
                    onPlay: s
                } = e;
                this.started || (this.startTime = nk(this.startTime, t));
                let o = Math.round(t - this.startTime) - n,
                    a = this.currentTime = Math.max(0, o),
                    l = this.generator.next(a),
                    u = o < 0 ? e.keyframes[0] : l.value;
                if (i) {
                    this.hasNextTarget = !1;
                    let {
                        keyframes: t
                    } = e;
                    t[0] = u, t[1] = this.nextTarget, this.retarget(t, this.nextVelocity ?? this.getGeneratorVelocity())
                }(i || !this.started) && (this.started = !0, s ?.()), "running" === this.state && (r ?.(u), l.done && o >= 0 && !i && !this.hasNextTarget && "running" === this.state && (this.notifyFinished(), this.teardown(), this.state = "finished", e.onComplete ?.()))
            }
            getGeneratorVelocity() {
                return nw(this.generator, this.currentTime, this.options.velocity)
            }
            now() {
                return this.driver ? this.driver.now() : t4.now()
            }
            teardown() {
                this.state = "idle", this.driver ? this.driver.stop() : (s6.delete(this), s6.size || tX(s9))
            }
        }

        function ot(t, e, i) {
            return function(t, e, i) {
                let n, r = t.get(),
                    s = null,
                    o = "string" == typeof r ? r.replace(/[\d.-]/g, "") : void 0,
                    a = t => n(o ? t + o : t),
                    l = () => t.events.animationStart ?.notify(),
                    u = () => {
                        s && (s.stop(), s = null), t.animation = void 0
                    };
                if (t.attach((e, r) => {
                        n = r;
                        let o = rB(e);
                        if (s ?.state === "running") return void s.setTarget(o, i.velocity);
                        let h = rB(t.get()),
                            d = s ? s.getGeneratorVelocity() : t.getVelocity();
                        if (u(), h === o) return;
                        let c = s = new s7({ ...{
                                keyframes: [h, o],
                                velocity: d,
                                restDelta: .001,
                                restSpeed: .01,
                                ...i,
                                onUpdate: a
                            },
                            onPlay: l
                        });
                        t.animation = c, c.then(() => {
                            s === c && (s = null, t.animation = void 0, t.events.animationComplete ?.notify())
                        })
                    }, u), Z(e)) {
                    let n = !0 === i.skipInitialAnimation,
                        r = e => {
                            var i, r, s, a;
                            n ? (n = !1, t.jump((i = e, (r = o) ? i + r : i), !1)) : t.set((s = e, (a = o) ? s + a : s))
                        },
                        s = e.on("change", r),
                        a = e.get();
                    rB(a) - rB(t.get()) && r(a);
                    let l = t.on("destroy", s);
                    return () => {
                        s(), l(), u()
                    }
                }
                return u
            }(t, e, { ...i,
                type: i8
            })
        }

        function oe(t, e, i, n) {
            if ("function" == typeof t) {
                let e;
                return eu.current = [], t(), e = s2(eu.current, t), eu.current = void 0, e
            }
            if (void 0 !== i && !Array.isArray(i) && "function" != typeof e) {
                var r = t,
                    s = e,
                    o = i,
                    a = n;
                let l = ic(() => Object.keys(o)),
                    u = ic(() => ({}));
                for (let t of l) u[t] = oe(r, s, o[t], a);
                return u
            }
            let l = "function" == typeof e ? e : function(...t) {
                    let e = !Array.isArray(t[0]),
                        i = e ? 0 : -1,
                        n = t[0 + i],
                        r = ng(t[1 + i], t[2 + i], t[3 + i]);
                    return e ? r(n) : r
                }(e, i, n),
                u = Array.isArray(t) ? oi(t, l) : oi([t], ([t]) => l(t)),
                h = Array.isArray(t) ? void 0 : t.accelerate;
            if (h && !h.isTransformed && "function" != typeof e && Array.isArray(i) && n ?.clamp !== !1) {
                let t = n ?.ease;
                u.accelerate = { ...h,
                    times: [0, ...e, 1],
                    keyframes: [i[0], ...i, i[i.length - 1]],
                    isTransformed: !0,
                    ...t ? {
                        ease: Array.isArray(t) ? [t[0], ...t] : t
                    } : {}
                }
            }
            return u
        }

        function oi(t, e) {
            let i = ic(() => []);
            return s2(t, () => {
                i.length = 0;
                let n = t.length;
                for (let e = 0; e < n; e++) i[e] = t[e].get();
                return e(i)
            })
        }

        function on(t, e = {}) {
            return function(t, e, i) {
                let {
                    isStatic: n
                } = (0, s.useContext)(it), r = () => Z(t) ? t.get() : t;
                if (n) return oe(r);
                let o = s3(r());
                return (0, s.useInsertionEffect)(() => i(o, t, e), [o, JSON.stringify(e)]), o
            }(t, e, ot)
        }
        var sK = sK;
        let or = {
                "/products/crimson-memory-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 540,
                    hookApexY: 18,
                    loopTopY: 18,
                    loopCenterX: 542,
                    loopInnerTopY: 24,
                    loopInnerBottomY: 53,
                    neckY: 116,
                    garmentTopY: 18,
                    garmentBottomY: 1359,
                    shoulderY: 548,
                    shoulderX0: 162,
                    shoulderX1: 909,
                    garmentX0: 45,
                    garmentX1: 1040
                },
                "/products/crimson-memory-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 538,
                    hookApexY: 17,
                    loopTopY: 17,
                    loopCenterX: 535,
                    loopInnerTopY: 24,
                    loopInnerBottomY: 51,
                    neckY: 115,
                    garmentTopY: 17,
                    garmentBottomY: 1317,
                    shoulderY: 535,
                    shoulderX0: 187,
                    shoulderX1: 890,
                    garmentX0: 107,
                    garmentX1: 969
                },
                "/products/crimson-memory-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 532,
                    hookApexY: 15,
                    loopTopY: 15,
                    loopCenterX: 531,
                    loopInnerTopY: 22,
                    loopInnerBottomY: 50,
                    neckY: 107,
                    garmentTopY: 15,
                    garmentBottomY: 1345,
                    shoulderY: 539,
                    shoulderX0: 424,
                    shoulderX1: 657,
                    garmentX0: 388,
                    garmentX1: 694
                },
                "/products/distressed-logo-t-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 552,
                    hookApexY: 35,
                    loopTopY: 35,
                    loopCenterX: 556,
                    loopInnerTopY: 41,
                    loopInnerBottomY: 79,
                    neckY: 153,
                    garmentTopY: 35,
                    garmentBottomY: 1328,
                    shoulderY: 563,
                    shoulderX0: 92,
                    shoulderX1: 994,
                    garmentX0: 45,
                    garmentX1: 1041
                },
                "/products/distressed-logo-t-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 541,
                    hookApexY: 29,
                    loopTopY: 29,
                    loopCenterX: 536,
                    loopInnerTopY: 38,
                    loopInnerBottomY: 75,
                    neckY: 146,
                    garmentTopY: 29,
                    garmentBottomY: 1317,
                    shoulderY: 554,
                    shoulderX0: 106,
                    shoulderX1: 978,
                    garmentX0: 60,
                    garmentX1: 1024
                },
                "/products/distressed-logo-t-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 532,
                    hookApexY: 26,
                    loopTopY: 26,
                    loopCenterX: 529,
                    loopInnerTopY: 35,
                    loopInnerBottomY: 66,
                    neckY: 131,
                    garmentTopY: 26,
                    garmentBottomY: 1333,
                    shoulderY: 551,
                    shoulderX0: 447,
                    shoulderX1: 648,
                    garmentX0: 405,
                    garmentX1: 687
                },
                "/products/its-us-tee-black-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 542,
                    hookApexY: 25,
                    loopTopY: 25,
                    loopCenterX: 544,
                    loopInnerTopY: 30,
                    loopInnerBottomY: 66,
                    neckY: 150,
                    garmentTopY: 25,
                    garmentBottomY: 1328,
                    shoulderY: 562,
                    shoulderX0: 120,
                    shoulderX1: 961,
                    garmentX0: 51,
                    garmentX1: 1033
                },
                "/products/its-us-tee-black-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 542,
                    hookApexY: 23,
                    loopTopY: 23,
                    loopCenterX: 539,
                    loopInnerTopY: 31,
                    loopInnerBottomY: 66,
                    neckY: 150,
                    garmentTopY: 23,
                    garmentBottomY: 1332,
                    shoulderY: 562,
                    shoulderX0: 123,
                    shoulderX1: 956,
                    garmentX0: 55,
                    garmentX1: 1029
                },
                "/products/its-us-tee-black-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 543,
                    hookApexY: 27,
                    loopTopY: 27,
                    loopCenterX: 541,
                    loopInnerTopY: 33,
                    loopInnerBottomY: 68,
                    neckY: 141,
                    garmentTopY: 27,
                    garmentBottomY: 1376,
                    shoulderY: 567,
                    shoulderX0: 443,
                    shoulderX1: 659,
                    garmentX0: 383,
                    garmentX1: 726
                },
                "/products/its-us-tee-bubblegum-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 540,
                    hookApexY: 0,
                    loopTopY: 0,
                    loopCenterX: 537,
                    loopInnerTopY: 23,
                    loopInnerBottomY: 55,
                    neckY: 133,
                    garmentTopY: 0,
                    garmentBottomY: 1344,
                    shoulderY: 555,
                    shoulderX0: 97,
                    shoulderX1: 989,
                    garmentX0: 67,
                    garmentX1: 1019
                },
                "/products/its-us-tee-bubblegum-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 539,
                    hookApexY: 0,
                    loopTopY: 0,
                    loopCenterX: 537,
                    loopInnerTopY: 24,
                    loopInnerBottomY: 55,
                    neckY: 132,
                    garmentTopY: 0,
                    garmentBottomY: 1346,
                    shoulderY: 556,
                    shoulderX0: 99,
                    shoulderX1: 986,
                    garmentX0: 68,
                    garmentX1: 1018
                },
                "/products/its-us-tee-bubblegum-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 537,
                    hookApexY: 10,
                    loopTopY: 10,
                    loopCenterX: 535,
                    loopInnerTopY: 24,
                    loopInnerBottomY: 54,
                    neckY: 127,
                    garmentTopY: 10,
                    garmentBottomY: 1369,
                    shoulderY: 555,
                    shoulderX0: 445,
                    shoulderX1: 645,
                    garmentX0: 405,
                    garmentX1: 684
                },
                "/products/its-us-tee-yellow-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 537,
                    hookApexY: 24,
                    loopTopY: 24,
                    loopCenterX: 542,
                    loopInnerTopY: 31,
                    loopInnerBottomY: 72,
                    neckY: 145,
                    garmentTopY: 24,
                    garmentBottomY: 1328,
                    shoulderY: 559,
                    shoulderX0: 112,
                    shoulderX1: 974,
                    garmentX0: 59,
                    garmentX1: 1026
                },
                "/products/its-us-tee-yellow-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 540,
                    hookApexY: 23,
                    loopTopY: 23,
                    loopCenterX: 537,
                    loopInnerTopY: 30,
                    loopInnerBottomY: 64,
                    neckY: 140,
                    garmentTopY: 23,
                    garmentBottomY: 1331,
                    shoulderY: 556,
                    shoulderX0: 112,
                    shoulderX1: 975,
                    garmentX0: 61,
                    garmentX1: 1027
                },
                "/products/its-us-tee-yellow-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 538,
                    hookApexY: 28,
                    loopTopY: 28,
                    loopCenterX: 536,
                    loopInnerTopY: 34,
                    loopInnerBottomY: 66,
                    neckY: 139,
                    garmentTopY: 28,
                    garmentBottomY: 1367,
                    shoulderY: 565,
                    shoulderX0: 449,
                    shoulderX1: 643,
                    garmentX0: 407,
                    garmentX1: 685
                },
                "/products/jersey-blue-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 538,
                    hookApexY: 18,
                    loopTopY: 18,
                    loopCenterX: 536,
                    loopInnerTopY: 25,
                    loopInnerBottomY: 62,
                    neckY: 143,
                    garmentTopY: 18,
                    garmentBottomY: 1368,
                    shoulderY: 571,
                    shoulderX0: 129,
                    shoulderX1: 959,
                    garmentX0: 67,
                    garmentX1: 1023
                },
                "/products/jersey-blue-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 539,
                    hookApexY: 17,
                    loopTopY: 17,
                    loopCenterX: 537,
                    loopInnerTopY: 25,
                    loopInnerBottomY: 58,
                    neckY: 140,
                    garmentTopY: 17,
                    garmentBottomY: 1367,
                    shoulderY: 568,
                    shoulderX0: 148,
                    shoulderX1: 941,
                    garmentX0: 87,
                    garmentX1: 1002
                },
                "/products/jersey-blue-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 538,
                    hookApexY: 16,
                    loopTopY: 16,
                    loopCenterX: 535,
                    loopInnerTopY: 25,
                    loopInnerBottomY: 53,
                    neckY: 130,
                    garmentTopY: 16,
                    garmentBottomY: 1388,
                    shoulderY: 562,
                    shoulderX0: 413,
                    shoulderX1: 658,
                    garmentX0: 376,
                    garmentX1: 701
                },
                "/products/jersey-yellow-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 539,
                    hookApexY: 36,
                    loopTopY: 36,
                    loopCenterX: 538,
                    loopInnerTopY: 41,
                    loopInnerBottomY: 71,
                    neckY: 148,
                    garmentTopY: 36,
                    garmentBottomY: 1328,
                    shoulderY: 560,
                    shoulderX0: 135,
                    shoulderX1: 947,
                    garmentX0: 92,
                    garmentX1: 991
                },
                "/products/jersey-yellow-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 539,
                    hookApexY: 36,
                    loopTopY: 36,
                    loopCenterX: 538,
                    loopInnerTopY: 44,
                    loopInnerBottomY: 73,
                    neckY: 150,
                    garmentTopY: 36,
                    garmentBottomY: 1326,
                    shoulderY: 560,
                    shoulderX0: 137,
                    shoulderX1: 947,
                    garmentX0: 94,
                    garmentX1: 991
                },
                "/products/jersey-yellow-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 528,
                    hookApexY: 38,
                    loopTopY: 38,
                    loopCenterX: 528,
                    loopInnerTopY: 46,
                    loopInnerBottomY: 73,
                    neckY: 142,
                    garmentTopY: 38,
                    garmentBottomY: 1332,
                    shoulderY: 550,
                    shoulderX0: 442,
                    shoulderX1: 653,
                    garmentX0: 397,
                    garmentX1: 699
                },
                "/products/silicone-tee-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 541,
                    hookApexY: 30,
                    loopTopY: 30,
                    loopCenterX: 536,
                    loopInnerTopY: 35,
                    loopInnerBottomY: 70,
                    neckY: 132,
                    garmentTopY: 30,
                    garmentBottomY: 1348,
                    shoulderY: 556,
                    shoulderX0: 130,
                    shoulderX1: 956,
                    garmentX0: 79,
                    garmentX1: 1006
                },
                "/products/silicone-tee-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 541,
                    hookApexY: 34,
                    loopTopY: 34,
                    loopCenterX: 536,
                    loopInnerTopY: 40,
                    loopInnerBottomY: 74,
                    neckY: 132,
                    garmentTopY: 34,
                    garmentBottomY: 1346,
                    shoulderY: 556,
                    shoulderX0: 130,
                    shoulderX1: 954,
                    garmentX0: 80,
                    garmentX1: 1004
                },
                "/products/silicone-tee-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 545,
                    hookApexY: 33,
                    loopTopY: 33,
                    loopCenterX: 539,
                    loopInnerTopY: 41,
                    loopInnerBottomY: 74,
                    neckY: 127,
                    garmentTopY: 33,
                    garmentBottomY: 1356,
                    shoulderY: 531,
                    shoulderX0: 423,
                    shoulderX1: 654,
                    garmentX0: 383,
                    garmentX1: 705
                },
                "/products/tank-black-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 545,
                    hookApexY: 15,
                    loopTopY: 15,
                    loopCenterX: 545,
                    loopInnerTopY: 22,
                    loopInnerBottomY: 62,
                    neckY: 130,
                    garmentTopY: 15,
                    garmentBottomY: 1347,
                    shoulderY: 354,
                    shoulderX0: 179,
                    shoulderX1: 910,
                    garmentX0: 147,
                    garmentX1: 946
                },
                "/products/tank-black-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 543,
                    hookApexY: 18,
                    loopTopY: 18,
                    loopCenterX: 540,
                    loopInnerTopY: 27,
                    loopInnerBottomY: 71,
                    neckY: 131,
                    garmentTopY: 18,
                    garmentBottomY: 1355,
                    shoulderY: 355,
                    shoulderX0: 179,
                    shoulderX1: 906,
                    garmentX0: 153,
                    garmentX1: 934
                },
                "/products/tank-black-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 552,
                    hookApexY: 18,
                    loopTopY: 18,
                    loopCenterX: 552,
                    loopInnerTopY: 27,
                    loopInnerBottomY: 67,
                    neckY: 116,
                    garmentTopY: 18,
                    garmentBottomY: 1402,
                    shoulderY: 564,
                    shoulderX0: 435,
                    shoulderX1: 643,
                    garmentX0: 383,
                    garmentX1: 691
                },
                "/products/tank-sand-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 539,
                    hookApexY: 19,
                    loopTopY: 19,
                    loopCenterX: 535,
                    loopInnerTopY: 26,
                    loopInnerBottomY: 58,
                    neckY: 134,
                    garmentTopY: 19,
                    garmentBottomY: 1375,
                    shoulderY: 358,
                    shoulderX0: 180,
                    shoulderX1: 904,
                    garmentX0: 172,
                    garmentX1: 914
                },
                "/products/tank-sand-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 540,
                    hookApexY: 16,
                    loopTopY: 16,
                    loopCenterX: 536,
                    loopInnerTopY: 28,
                    loopInnerBottomY: 61,
                    neckY: 136,
                    garmentTopY: 16,
                    garmentBottomY: 1374,
                    shoulderY: 356,
                    shoulderX0: 181,
                    shoulderX1: 904,
                    garmentX0: 178,
                    garmentX1: 908
                },
                "/products/tank-sand-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 539,
                    hookApexY: 22,
                    loopTopY: 22,
                    loopCenterX: 536,
                    loopInnerTopY: 30,
                    loopInnerBottomY: 59,
                    neckY: 130,
                    garmentTopY: 22,
                    garmentBottomY: 1382,
                    shoulderY: 562,
                    shoulderX0: 447,
                    shoulderX1: 642,
                    garmentX0: 403,
                    garmentX1: 684
                },
                "/products/varsity-back.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 540,
                    hookApexY: 50,
                    loopTopY: 50,
                    loopCenterX: 538,
                    loopInnerTopY: 57,
                    loopInnerBottomY: 91,
                    neckY: 163,
                    garmentTopY: 50,
                    garmentBottomY: 1336,
                    shoulderY: 571,
                    shoulderX0: 140,
                    shoulderX1: 944,
                    garmentX0: 49,
                    garmentX1: 1042
                },
                "/products/varsity-front.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 540,
                    hookApexY: 49,
                    loopTopY: 49,
                    loopCenterX: 538,
                    loopInnerTopY: 59,
                    loopInnerBottomY: 89,
                    neckY: 153,
                    garmentTopY: 49,
                    garmentBottomY: 1284,
                    shoulderY: 547,
                    shoulderX0: 165,
                    shoulderX1: 919,
                    garmentX0: 82,
                    garmentX1: 1009
                },
                "/products/varsity-side.webp": {
                    width: 1086,
                    height: 1448,
                    hookApexX: 535,
                    hookApexY: 27,
                    loopTopY: 27,
                    loopCenterX: 534,
                    loopInnerTopY: 36,
                    loopInnerBottomY: 62,
                    neckY: 122,
                    garmentTopY: 27,
                    garmentBottomY: 1339,
                    shoulderY: 546,
                    shoulderX0: 406,
                    shoulderX1: 695,
                    garmentX0: 377,
                    garmentX1: 719
                }
            };
        let defaultGeom = {
            width: 1086,
            height: 1448,
            hookApexX: 538,
            hookApexY: 17,
            loopTopY: 17,
            loopCenterX: 535,
            loopInnerTopY: 24,
            loopInnerBottomY: 51,
            neckY: 115,
            garmentTopY: 17,
            garmentBottomY: 1317,
            shoulderY: 535,
            shoulderX0: 187,
            shoulderX1: 890,
            garmentX0: 107,
            garmentX1: 969
        };
        let defaultSideGeom = {
            width: 420,
            height: 1448,
            hookApexX: 210,
            hookApexY: 15,
            loopTopY: 15,
            loopCenterX: 210,
            loopInnerTopY: 22,
            loopInnerBottomY: 50,
            neckY: 107,
            garmentTopY: 15,
            garmentBottomY: 1345,
            shoulderY: 539,
            shoulderX0: 160,
            shoulderX1: 260,
            garmentX0: 140,
            garmentX1: 280
        };
        try {
            or = new Proxy(or, {
                get(target, prop) {
                    if (prop in target) return target[prop];
                    if (typeof prop === "string" && prop.length > 0) {
                        return defaultGeom;
                    }
                    return target[prop];
                }
            });
        } catch (e) {}
        let os = {};
        try {
            os = new Proxy(os, {
                get(target, prop) {
                    if (typeof prop === "string" && (prop.includes("upload") || !prop.startsWith("/products/"))) {
                        return 1;
                    }
                    if (prop in target) return target[prop];
                    return 1;
                }
            });
        } catch (e) {}
        let oo = t => (or[t] ? (or[t].garmentBottomY - or[t].garmentTopY) : 1300);

        function oa(t) {
            let e = `/products/${t}-back.webp`,
                i = {
                    side: `/products/${t}-side.webp`,
                    front: `/products/${t}-front.webp`,
                    back: e in or ? e : void 0
                };
            for (let t of [i.side, i.front, i.back]) t && (os[t] = oo(i.side) / oo(t));
            return i
        }
        let ol = "https://checkout.snugwrld.com/products/",
            ou = (t, e, i, n) => ({
                slug: t,
                name: e,
                colour: i,
                ...oa(t),
                url: n
            });

        function oh(t, e, i, n) {
            let r = n.map(([t, e, i]) => ({
                label: t,
                hex: e,
                ...oa(i)
            }));
            var s = r;
            for (let t of ["front", "back"]) {
                let e = s[0][t];
                if (!e) continue;
                let i = or[e];
                for (let n of s.slice(1)) {
                    let r = n[t];
                    if (!r) continue;
                    let s = or[r];
                    od[r] = {
                        ref: e,
                        sx: (i.shoulderX1 - i.shoulderX0) / (s.shoulderX1 - s.shoulderX0),
                        sy: (i.garmentBottomY - oc(i)) / (s.garmentBottomY - oc(s))
                    }
                }
            }
            let {
                side: o,
                front: a,
                back: l
            } = r[0];
            return {
                slug: t,
                name: e,
                side: o,
                front: a,
                back: l,
                colourways: r,
                url: i
            }
        }
        let od = {},
            oc = t => ((or[t] ? (or[t].loopInnerTopY + or[t].loopInnerBottomY) : 50) / 2);

        let defaultOp = [ou("crimson-memory", "Crimson Memory LS Shirt", "White", `${ol}crimson-memory-shirt`), oh("its-us-tee", "It's Us Never Them Tee", `${ol}its-us-never-them-tee-pink`, [
                ["Black", "#1e1e1e", "its-us-tee-black"],
                ["Pink", "#f6b1b4", "its-us-tee-bubblegum"],
                ["Yellow", "#f8dd2f", "its-us-tee-yellow"]
            ]), oh("tank", "Distressed Painted Logo Tank Top", `${ol}distressed-sleeveless-vintage-light-beige`, [
                ["Black", "#2d2d2c", "tank-black"],
                ["Sand", "#b29e8b", "tank-sand"]
            ]), ou("varsity", "Snug Wrld Logo Varsity Jacket", "Black", `${ol}snug-wrld-varsity-jackets`), ou("distressed-logo-t", "Distressed Logo Print T-Shirt", "Blue", `${ol}distressed-logo-print-t-shirt`), oh("jersey", "Snug Football Jersey", `${ol}snug-jersey-blue`, [
                ["Yellow", "#e3ca1e", "jersey-yellow"],
                ["Blue", "#0842a9", "jersey-blue"]
            ]), ou("silicone-tee", "Silicone Logo Print T-Shirt", "White", `${ol}silicone-logo-tee`)];

        function getDynamicOp() {
            try {
                let dbList = (typeof window !== "undefined") ? (window.__DB_PRODUCTS__ || (window.__INITIAL_DATA__ && window.__INITIAL_DATA__.products)) : null;
                if (!dbList || !Array.isArray(dbList) || dbList.length === 0) {
                    return defaultOp;
                }
                let base = (typeof window !== "undefined" && window.STORE_BASE_PATH) ? window.STORE_BASE_PATH : "/";
                if (!base.endsWith("/")) base += "/";

                return dbList.map((p, idx) => {
                    let s = p.slug || ('p-' + (p.id || idx));
                    let name = p.title_fa || p.title || 'محصول';
                    let colour = p.color || '';
                    let url = p.buy_url || '';

                    let cleanFront = p.front_image ? ('/' + p.front_image.replace(/^\/+/, '')) : '';
                    let cleanSide = p.side_image ? ('/' + p.side_image.replace(/^\/+/, '')) : '';
                    let cleanBack = p.back_image ? ('/' + p.back_image.replace(/^\/+/, '')) : '';

                    let matched = defaultOp.find(orig => orig.slug === s);
                    let rawCw = p.colourways;
                    if (typeof rawCw === 'string') {
                        try { rawCw = JSON.parse(rawCw); } catch(e) { rawCw = null; }
                    }

                    if (!cleanFront && !cleanSide && !cleanBack && matched && (!rawCw || !Array.isArray(rawCw) || rawCw.length === 0)) {
                        return { ...matched, name, colour, url };
                    }

                    let front = cleanFront || (matched ? matched.front : `/products/${s}-front.webp`);
                    let side = cleanSide || (matched ? matched.side : (cleanFront || `/products/${s}-side.webp`));
                    let back = cleanBack || (matched ? matched.back : undefined);

                    // Front geometry: only set if not already in original or
                    if (!or[front]) or[front] = defaultGeom;
                    if (!or[front.replace(/^\/+/, '')]) or[front.replace(/^\/+/, '')] = defaultGeom;
                    os[front] = 1;
                    os[front.replace(/^\/+/, '')] = 1;

                    // Side view geometry:
                    if (!or[side]) or[side] = defaultGeom;
                    if (!or[side.replace(/^\/+/, '')]) or[side.replace(/^\/+/, '')] = defaultGeom;
                    os[side] = 1;
                    os[side.replace(/^\/+/, '')] = 1;

                    // Back view geometry
                    if (back) {
                        if (!or[back]) or[back] = defaultGeom;
                        if (!or[back.replace(/^\/+/, '')]) or[back.replace(/^\/+/, '')] = defaultGeom;
                        os[back] = 1;
                        os[back.replace(/^\/+/, '')] = 1;
                    }

                    // Process colourways
                    let colourways = null;
                    if (Array.isArray(rawCw) && rawCw.length > 0) {
                        colourways = rawCw.map((cw, cIdx) => {
                            let rawF = cw.front || cw.image || cw.front_image || cw.url;
                            let rawS = cw.side || cw.side_image;
                            let rawB = cw.back || cw.back_image;

                            // Match built-in colourways if rawF not specified
                            if (!rawF && matched && matched.colourways) {
                                let mcw = matched.colourways.find(item => item.label.toLowerCase() === (cw.label || cw.name || '').toLowerCase());
                                if (mcw) {
                                    rawF = mcw.front;
                                    rawS = rawS || mcw.side;
                                    rawB = rawB || mcw.back;
                                }
                            }
                            if (!rawF) rawF = front;
                            if (!rawS) rawS = side;

                            let cwFront = '/' + rawF.replace(/^\/+/, '');
                            let cwSide  = '/' + rawS.replace(/^\/+/, '');
                            let cwBack  = rawB ? ('/' + rawB.replace(/^\/+/, '')) : back;

                            if (!or[cwFront]) or[cwFront] = defaultGeom;
                            if (!or[cwFront.replace(/^\/+/, '')]) or[cwFront.replace(/^\/+/, '')] = defaultGeom;
                            os[cwFront] = 1;
                            os[cwFront.replace(/^\/+/, '')] = 1;

                            if (!or[cwSide]) or[cwSide] = defaultGeom;
                            if (!or[cwSide.replace(/^\/+/, '')]) or[cwSide.replace(/^\/+/, '')] = defaultGeom;
                            os[cwSide] = 1;
                            os[cwSide.replace(/^\/+/, '')] = 1;

                            if (cwBack) {
                                if (!or[cwBack]) or[cwBack] = defaultGeom;
                                if (!or[cwBack.replace(/^\/+/, '')]) or[cwBack.replace(/^\/+/, '')] = defaultGeom;
                                os[cwBack] = 1;
                                os[cwBack.replace(/^\/+/, '')] = 1;
                            }

                            return {
                                label: cw.label || cw.name || ('رنگ ' + (cIdx + 1)),
                                hex: cw.hex || cw.code || '#1e1e1e',
                                side: cwSide,
                                front: cwFront,
                                back: cwBack
                            };
                        });
                    } else if (matched && matched.colourways) {
                        colourways = matched.colourways;
                    }

                    return {
                        slug: s,
                        name: name,
                        colour: colour,
                        side: side,
                        front: front,
                        back: back,
                        colourways: colourways || void 0,
                        url: url
                    };
                });
            } catch (e) {
                return defaultOp;
            }
        }

        let op = getDynamicOp();
        if (typeof window !== "undefined") {
            window.__RACK_OP__ = op;
        }
        let 
            om = t => `(var(--iw) * ${os[t]??1})`,
            of = (t, e, i) => `${om(t)} * ${i/e.width}`;

        function og({
            layers: t,
            turn: e,
            swing: i,
            bodyScale: n,
            part: s = "hanger"
        }) {
            return (0, r.jsx)(sG.div, {
                className: "garment",
                style: {
                    rotateZ: i
                },
                children: (0, r.jsx)(sG.div, {
                    className: "garment-card",
                    style: {
                        rotateY: e
                    },
                    children: t.map(({
                        src: t,
                        opacity: e,
                        sizes: i,
                        preload: o
                    }, nIdx) => {
                        let a = or[t] || defaultGeom,
                            isCustom = (typeof t === "string" && (t.includes("upload") || !t.startsWith("/products/"))),
                            l = (a.loopInnerTopY + a.loopInnerBottomY) / 2,
                            u = {
                                left: `calc(-1 * ${om(t)} * ${a.loopCenterX/a.width})`,
                                top: isCustom ? "calc(var(--rod) / 2 + var(--custom-top, 0px))" : `calc(var(--rod) / 2 - ${of(t,a,l)})`,
                                width: `calc(${om(t)})`,
                                aspectRatio: `${a.width} / ${a.height}`
                            },
                            h = (0, r.jsx)(sK.Image, {
                                src: t,
                                width: a.width,
                                height: a.height,
                                sizes: i,
                                alt: "",
                                preload: o,
                                loading: o ? void 0 : "eager",
                                draggable: !1
                            });
                        if ("crest" === s) {
                            if (isCustom) return null;
                            let i = `calc(${of(t,a,l)} - var(--rod) / 2)`;
                            return (0, r.jsx)(sG.div, {
                                className: "garment-layer",
                                style: { ...u,
                                    opacity: e,
                                    clipPath: `inset(0 0 calc(100% - ${i}) 0)`
                                },
                                children: h
                            }, t)
                        }
                        if (isCustom) {
                            let isSide = (nIdx === 0);
                            return (0, r.jsx)(sG.div, {
                                className: "garment-layer layer-custom" + (isSide ? " layer-side" : " layer-front"),
                                style: {
                                    ...u,
                                    opacity: e
                                },
                                children: (0, r.jsx)(sG.div, {
                                    className: "garment-piece",
                                    style: {
                                        scale: n,
                                        originX: 0.5,
                                        originY: 0.1
                                    },
                                    children: h
                                })
                            }, t);
                        }
                        let d = `${(a.neckY/a.height*100).toFixed(3)}%`;
                        return (0, r.jsxs)(sG.div, {
                            className: "garment-layer",
                            style: { ...u,
                                opacity: e
                            },
                            children: [(0, r.jsx)("div", {
                                className: "garment-piece",
                                style: {
                                    clipPath: `inset(0 0 calc(100% - ${d}) 0)`
                                },
                                children: h
                            }), (0, r.jsx)(sG.div, {
                                className: "garment-piece",
                                style: {
                                    clipPath: `inset(${d} 0 0 0)`,
                                    scale: n,
                                    originX: a.loopCenterX / a.width,
                                    originY: a.neckY / a.height
                                },
                                children: h
                            })]
                        }, t)
                    })
                })
            })
        }

        function oy(t, e, i) {
            let n = (0, s.useRef)(0),
                r = (0, s.useRef)(0),
                o = (0, s.useRef)(0),
                a = (0, s.useCallback)(() => {
                    cancelAnimationFrame(n.current), r.current++, o.current = 0
                }, []),
                l = (0, s.useCallback)((s, {
                    kick: a = 0,
                    eps: l = 0,
                    swingRest: u = 0,
                    onDone: h
                } = {}) => {
                    cancelAnimationFrame(n.current);
                    let d = ++r.current;
                    if (i) {
                        t.set(s), e.set(u), o.current = 0, h ?.();
                        return
                    }
                    let c = t.get(),
                        p = e.get(),
                        m = o.current,
                        f = a,
                        g = performance.now(),
                        y = h,
                        v = i => {
                            let a = Math.min(.032, (i - g) / 1e3);
                            if (g = i, m += ((s - c) * 120 - 14 * m) * a, c += m * a, f += ((u - p) * 90 - 5 * f + .02 * m) * a, p += f * a, o.current = m, t.set(c), e.set(p), l && y && Math.abs(s - c) < l) {
                                let t = y;
                                if (y = void 0, t(), r.current !== d) return
                            }
                            if (.05 > Math.abs(s - c) && .5 > Math.abs(m) && .03 > Math.abs(p - u) && .05 > Math.abs(f)) {
                                t.set(s), e.set(u), o.current = 0, y ?.();
                                return
                            }
                            n.current = requestAnimationFrame(v)
                        };
                    n.current = requestAnimationFrame(v)
                }, [t, e, i]);
            return (0, s.useEffect)(() => () => cancelAnimationFrame(n.current), []), {
                springTo: l,
                stop: a
            }
        }

        function ov({
            product: t,
            index: e,
            count: i,
            hovered: n,
            shift: o,
            zIndex: a,
            pushDir: l,
            hidden: u
        }) {
            let h = s8(),
                d = s3(0),
                c = s3(0),
                {
                    springTo: p
                } = oy(d, c, h),
                m = oe(d, t => t <= 90 ? t : t - 180),
                f = oe(d, t => +(t <= 90)),
                g = oe(d, t => t <= 90 ? 0 : 1),
                y = on(1, {
                    stiffness: 210,
                    damping: 20
                }),
                v = on(0, {
                    stiffness: 170,
                    damping: 22
                }),
                x = s4 `calc(var(--iw) * ${v}) 0`,
                w = (0, s.useRef)(!0);
            (0, s.useEffect)(() => {
                if (w.current) {
                    w.current = !1;
                    return
                }
                let t = -(l.current ?? 1) * (n ? 26 : 16);
                p(180 * !!n, {
                    kick: t
                }), h ? y.jump(n ? 1.12 : 1) : y.set(n ? 1.12 : 1)
            }, [n, h, p, y, l]), (0, s.useEffect)(() => {
                h ? v.jump(o) : v.set(o)
            }, [o, h, v]);
            let b = [{
                src: t.side,
                opacity: f,
                sizes: "36vh",
                preload: !0
            }, {
                src: t.front,
                opacity: g,
                sizes: "41vh"
            }];
            return (0, r.jsxs)("div", {
                className: "rack-item",
                style: {
                    "--i": e - (i - 1) / 2,
                    visibility: u ? "hidden" : void 0
                },
                "aria-label": t.name,
                children: [(0, r.jsx)(sG.div, {
                    className: "rack-layer rack-garment",
                    style: {
                        translate: x,
                        zIndex: 3 + a
                    },
                    children: (0, r.jsx)(og, {
                        turn: m,
                        swing: c,
                        bodyScale: y,
                        layers: b
                    })
                }), (0, r.jsx)(sG.div, {
                    className: "rack-layer",
                    style: {
                        translate: x,
                        zIndex: 205
                    },
                    children: (0, r.jsx)("div", {
                        className: "hook-contact-line"
                    })
                }), (0, r.jsx)(sG.div, {
                    className: "rack-layer",
                    style: {
                        translate: x,
                        zIndex: 210
                    },
                    children: (0, r.jsx)(og, {
                        turn: m,
                        swing: c,
                        layers: b,
                        part: "crest"
                    })
                })]
            })
        }
        let ox = Math.max(...op.flatMap(t => [t.side, t.front].map(e => {
            let i = or[e],
                n = (os[e] ?? 1) / i.width,
                r = (i.loopInnerTopY + i.loopInnerBottomY) / 2,
                s = e === t.front ? 1.12 : 1;
            return (i.neckY - r + (i.garmentBottomY - i.neckY) * s) * n
        })));

        function ow(t, e = !1) {
            let i = document.querySelector(".rack"),
                n = i ?.querySelectorAll(".rack-item")[t];
            if (!i || !n) return null;
            let r = n.getBoundingClientRect(),
                s = getComputedStyle(i),
                o = parseFloat(getComputedStyle(i.querySelector(".rack-rail")).height) || 0;
            return {
                x: r.left,
                y: r.top,
                iw: parseFloat(s.getPropertyValue("--iw-px")) || 0,
                rod: o,
                hovered: e
            }
        }

        function ob({
            onSelect: t,
            hiddenIndex: e = null,
            paused: i = !1
        }) {
            let n = op.length,
                o = (n - 1) / 2,
                a = (0, s.useRef)(null),
                [l, u] = (0, s.useState)(null),
                [h, d] = (0, s.useState)(null),
                c = (0, s.useRef)(null),
                p = (0, s.useRef)(1),
                m = (0, s.useCallback)((t, e) => {
                    let i = a.current;
                    if (!i) return null;
                    let r = i.getBoundingClientRect(),
                        s = parseFloat(getComputedStyle(i).getPropertyValue("--iw-px")) || 0;
                    if (!s) return null;
                    let l = .33 * s,
                        u = r.top + .272 * r.height;
                    if (e < u - 24 || e > u + 1.3 * s) return null;
                    let h = r.left + r.width / 2,
                        d = t => h + (t - o) * l,
                        p = c.current;
                    if (null !== p && Math.abs(t - d(p)) < .45 * s) return p;
                    let m = Math.max(0, Math.min(n - 1, Math.round((t - h) / l + o))),
                        f = l / 2 + (0 === m || m === n - 1 ? .05 * s : 0);
                    return Math.abs(t - d(m)) < f ? m : null
                }, [o, n]),
                f = (0, s.useCallback)(t => {
                    t !== c.current && (null !== c.current && d(c.current), c.current = t, u(t))
                }, []);
            return (0, s.useEffect)(() => {
                i && f(null)
            }, [i, f]), (0, r.jsxs)("div", {
                ref: a,
                className: "rack",
                style: {
                    cursor: null === l ? "default" : "pointer"
                },
                onPointerMove: t => {
                    "touch" === t.pointerType || i || (t.movementX && (p.current = Math.sign(t.movementX)), f(m(t.clientX, t.clientY)))
                },
                onPointerLeave: () => f(null),
                onClick: e => {
                    if (i || !t) return;
                    let n = m(e.clientX, e.clientY),
                        r = null === n ? null : ow(n, c.current === n);
                    null !== n && r && t(n, r)
                },
                children: [(0, r.jsx)(s5, {
                    className: "rack-rail"
                }), op.map((t, i) => (0, r.jsx)(ov, {
                    product: t,
                    index: i,
                    count: n,
                    hovered: l === i,
                    shift: function(t, e) {
                        if (null === e || t === e) return 0;
                        let i = t - e;
                        return .25 * Math.sign(i) * Math.pow(.55, Math.abs(i) - 1)
                    }(i, l),
                    zIndex: l === i ? 100 : h === i ? 50 : i + 1,
                    pushDir: p,
                    hidden: e === i
                }, t.slug)), op.map((t, e) => {
                    let i;
                    return (0, r.jsx)("p", {
                        className: "rack-caption",
                        style: {
                            "--i": e - o,
                            "--hem": ox,
                            opacity: +(l === e)
                        },
                        "aria-hidden": l !== e,
                        children: (i = t.colourways ?.[0].label ?? t.colour) ? `${t.name} — ${i}` : t.name
                    }, t.slug)
                })]
            })
        }
        let oT = [];

        function ok(t) {
            tq(oT, t)
        }

        function oS(t, e, i = {}, n) {
            let r = [],
                {
                    velocity: s
                } = i,
                o = i.reduceMotion ?? n ?.shouldReduceMotion;
            for (let a in e) {
                if ("transition" === a || "transitionEnd" === a) continue;
                let l = e[a];
                if (void 0 === l) continue;
                let u = t(a),
                    h = u.get();
                if (void 0 !== h && !u.isAnimating() && !Array.isArray(l) && l === h && !s) {
                    tR.update(() => u.set(l));
                    continue
                }
                u.start(n_(a, u, l, o && J.has(a) ? {
                    type: !1
                } : i, n)), u.animation && r.push(u.animation)
            }
            let {
                transitionEnd: a
            } = e;
            if (a) {
                let e = () => tR.update(() => {
                    for (let e in a) t(e).set(a[e])
                });
                r.length ? Promise.all(r).then(e) : e()
            }
            return r
        }

        function oA(t, e, i, n, r) {
            return oS(n => {
                let s = t.get(e, n);
                if (!s) {
                    let a;
                    if (!r) {
                        var o;
                        let r, s = i[n];
                        a = (null === (r = Array.isArray(o = s) ? o[0] : void 0) ? void 0 : r) ?? t.read(e, n, s), ti(`"${n}" can't be read from the animated subject. Provide [from, to] keyframes.`)
                    }
                    t(e, {
                        [n]: s = ed(a, {
                            owner: r
                        })
                    })
                }
                return s
            }, i, n, r)
        }
        class oP {
            constructor(t) {
                this.stop = () => this.runAll("stop"), this.animations = t.filter(Boolean)
            }
            get finished() {
                return Promise.all(this.animations.map(t => t.finished))
            }
            getAll(t) {
                return this.animations[0][t]
            }
            setAll(t, e) {
                for (let i = 0; i < this.animations.length; i++) this.animations[i][t] = e
            }
            attachTimeline(t) {
                let e = this.animations.map(e => e.attachTimeline(t));
                return () => {
                    e.forEach((t, e) => {
                        t && t(), this.animations[e].stop()
                    })
                }
            }
            get time() {
                return this.getAll("time")
            }
            set time(t) {
                this.setAll("time", t)
            }
            get speed() {
                return this.getAll("speed")
            }
            set speed(t) {
                this.setAll("speed", t)
            }
            get state() {
                return this.getAll("state")
            }
            get startTime() {
                return this.getAll("startTime")
            }
            get duration() {
                return oM(this.animations, "duration")
            }
            get iterationDuration() {
                return oM(this.animations, "iterationDuration")
            }
            runAll(t) {
                this.animations.forEach(e => e[t]())
            }
            play() {
                this.runAll("play")
            }
            pause() {
                this.runAll("pause")
            }
            cancel() {
                this.runAll("cancel")
            }
            complete() {
                this.runAll("complete")
            }
        }

        function oM(t, e) {
            let i = 0;
            for (let n = 0; n < t.length; n++) {
                let r = t[n][e];
                null !== r && r > i && (i = r)
            }
            return i
        }
        class oC extends oP {
            then(t, e) {
                return this.finished.finally(t).then(() => {})
            }
        }

        function oE(t, e) {
            var i;
            let n;
            return nn(t) ? t[i = t.length, ((e - 0) % (n = i - 0) + n) % n + 0] : t
        }

        function oY(t) {
            return "object" == typeof t && !Array.isArray(t)
        }

        function oj(t, e, i, n) {
            return null == t ? [] : "string" == typeof t && oY(e) ? n7(t, i, n) : t instanceof NodeList ? Array.from(t) : Array.isArray(t) ? t.filter(t => null != t) : [t]
        }

        function oV(t, e, i, n) {
            return "number" == typeof e ? e : e.startsWith("-") || e.startsWith("+") ? Math.max(0, t + parseFloat(e)) : "<" === e ? i : e.startsWith("<") ? Math.max(0, i + parseFloat(e.slice(1))) : n.get(e) ?? t
        }

        function oI(t, e) {
            return t.at !== e.at ? t.at - e.at : null === t.value ? 1 : null === e.value ? -1 : 0
        }

        function oR(t, e) {
            return e.has(t) || e.set(t, {}), e.get(t)
        }

        function oX(t, e) {
            return e[t] || (e[t] = []), e[t]
        }
        let oD = t => "number" == typeof t,
            oB = t => t.every(oD);
        class oL {
            constructor(t = tR.render) {
                this.step = t, this.values = new Map, this.pending = [], this.numPending = 0, this.flush = () => {
                    let {
                        pending: t,
                        numPending: e
                    } = this;
                    this.numPending = 0;
                    for (let i = 0; i < e; i++) t[i]()
                }
            }
            set(t, e, i, n) {
                if (this.values.get(t) ?.onRemove(), n)
                    for (let t of this.values.values()) t.value === n && (i = t.render);
                let r = () => i && this.schedule(i);
                void 0 !== e.get() && r();
                let s = e.on("change", r),
                    o = () => {
                        s(), i && !n && this.cancel(i), this.values.get(t) ?.onRemove === o && this.values.delete(t)
                    };
                return this.values.set(t, {
                    value: e,
                    render: n ? void 0 : i,
                    onRemove: o
                }), o
            }
            get(t) {
                return this.values.get(t) ?.value
            }
            release() {
                let t = new Map;
                return this.values.forEach((e, i) => {
                    t.set(i, e.value), e.onRemove()
                }), this.transformKeys = this.transformValues = void 0, t
            }
            schedule(t) {
                let {
                    pending: e,
                    numPending: i
                } = this;
                for (let n = 0; n < i; n++)
                    if (e[n] === t) return;
                i || this.step(this.flush), e[this.numPending++] = t
            }
            cancel(t) {
                let {
                    pending: e
                } = this;
                for (let i = 0; i < this.numPending; i++)
                    if (e[i] === t) {
                        e[i] = e[--this.numPending];
                        return
                    }
            }
        }

        function oO(t, {
            step: e,
            ...i
        } = {}) {
            let n = new WeakMap;
            return Object.assign((i, r) => {
                let s = n.get(i) ?? new oL(e);
                n.set(i, s);
                let o = [];
                for (let e in r) {
                    let n = r[e],
                        a = t(i, s, e, n);
                    o.push(a)
                }
                return () => {
                    for (let t of o) t()
                }
            }, i, {
                get: (t, e) => n.get(t) ?.get(e),
                flush: t => n.get(t) ?.flush(),
                state: t => n.get(t)
            })
        }
        let o$ = {},
            oF = new Set(["originX", "originY", "originZ"]),
            oN = (t, e) => eC(t.get(e) ?.get(), U[e]),
            o_ = (t, e, i, n) => {
                let r, s;
                if (a.has(i)) {
                    if ("pathRotation" !== i) {
                        let t = e.transformKeys ?? (e.transformKeys = []);
                        (e.transformValues ?? (e.transformValues = {}))[i] = n, t.includes(i) || (t.push(i), t.sort((t, e) => o.indexOf(t) - o.indexOf(e)))
                    }
                    e.get("transform") || (sD(t) || e.get("transformBox") || o_(t, e, "transformBox", new eh("fill-box")), e.set("transform", new eh("none"), () => {
                        eo.get(t) ?.check(), t.style.transform = function(t) {
                            let e = "",
                                {
                                    transformKeys: i = [],
                                    transformValues: n = {}
                                } = t;
                            for (let t = 0; t < i.length; t++) {
                                let r = i[t],
                                    s = n[r].getCurrent();
                                void 0 !== s && ("number" == typeof s ? s : parseFloat(s)) !== +!!r.startsWith("scale") && (e += (e && " ") + (o$[r] || (o$[r] = (eE[r] || r) + "(")) + eC(s, _[r]) + ")")
                            }
                            let r = t.get("pathRotation") ?.get();
                            return r && (e += (e && " ") + "rotate(" + eC(r, _.pathRotation) + ")"), e || "none"
                        }(e)
                    })), s = e.get("transform")
                } else oF.has(i) ? (e.get("transformOrigin") || e.set("transformOrigin", new eh(""), () => {
                    let i = oN(e, "originX") ?? "50%",
                        n = oN(e, "originY") ?? "50%",
                        r = oN(e, "originZ") ?? 0;
                    t.style.transformOrigin = `${i} ${n} ${r}`
                }), s = e.get("transformOrigin")) : r = i.startsWith("--") ? () => {
                    t.style.setProperty(i, n.getCurrent())
                } : () => {
                    t.style[i] = eC(n.getCurrent(), U[i])
                };
                return e.set(i, n, r, s)
            },
            oU = (t, e) => {
                if (a.has(e)) return tb(t, e);
                let i = getComputedStyle(t),
                    n = e.startsWith("--") ? i.getPropertyValue(e) : i[e];
                return "string" == typeof n && n.trim() || 0
            },
            oW = oO(o_, {
                test: t => sD(t) || n9(t),
                read: oU
            }),
            oz = (t, e, i, n, r = i) => {
                let s = function(t, e) {
                    if (!(e in t)) return !1;
                    let i = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t), e) || Object.getOwnPropertyDescriptor(t, e);
                    return i && "function" == typeof i.set
                }(t, r);
                !s && (r.startsWith("data") || r.startsWith("aria")) && (r = eM(r));
                let o = U[i] || U[r],
                    a = s ? () => {
                        t[r] = eC(n.get(), U[i])
                    } : () => {
                        let e = eC(n.get(), o);
                        null == e ? t.removeAttribute(r) : t.setAttribute(r, String(e))
                    };
                return e.set(i, n, a)
            },
            oH = oO((t, e, i, n) => {
                if (i.startsWith("path")) return (tR.render(() => t.setAttribute("pathLength", "1")), "pathOffset" === i) ? e.set(i, n, () => {
                    let e = n.get();
                    t.setAttribute("stroke-dashoffset", `${-e}`)
                }) : (e.get("stroke-dasharray") || e.set("stroke-dasharray", new eh("1 1"), () => {
                    let i = e.get("pathLength") ?.get() ?? 1,
                        n = e.get("pathSpacing") ?.get();
                    t.setAttribute("stroke-dasharray", `${i} ${n??1-Number(i)}`)
                }), e.set(i, n, void 0, e.get("stroke-dasharray")));
                return i.startsWith("attr") ? oz(t, e, i, n, oq(i)) : (a.has(i) || oF.has(i) || i.startsWith("--") || i in t.style ? o_ : oz)(t, e, i, n)
            }, {
                test: n9,
                read: (t, e) => a.has(e) ? U[e] ?.default || 0 : e.startsWith("--") || eX.includes(e) ? oU(t, e) || t.getAttribute(eM(e)) || 0 : (e = oq(e), t.getAttribute(eM(e)) ?? t.getAttribute(e) ?? void 0)
            });

        function oq(t) {
            return t.replace(/^attr([A-Z])/, (t, e) => e.toLowerCase())
        }
        let oG = {};
        class oK {
            constructor(t, e) {
                this.effect = t, this.current = e, this.KeyframeResolver = tW
            }
            getValue(t) {
                return this.effect.get(this.current, t)
            }
            readValue(t, e) {
                return this.effect.read(this.current, t, e)
            }
            render() {
                this.effect.flush(this.current)
            }
            measureViewportBox() {
                return e2(this.current)
            }
            getProps() {
                return oG
            }
        }
        let oZ = oO((t, e, i, n) => e.set(i, n, () => {
            t[i] = n.get()
        }), {
            test: t => n6(t),
            read: (t, e) => {
                let i = t[e];
                return "string" == typeof i || "number" == typeof i ? i : void 0
            }
        });

        function oJ(t, e, i, n) {
            let r = [];
            if (Z(t) || "number" == typeof t || "string" == typeof t && !oY(e)) r.push(rX(t, oY(e) && e.default || e, i && i.default || i));
            else {
                if (null == t) return r;
                let s = oj(t, e, n),
                    o = s.length;
                ti();
                for (let t = 0; t < o; t++) {
                    let n = s[t],
                        a = { ...i
                        };
                    "delay" in a && "function" == typeof a.delay && (a.delay = a.delay(t, o)), n instanceof Element ? r.push(... function(t, e, i, n) {
                        if (n) return oS(t => n.getValue(t, null), e, i, n);
                        let r = n9(t) ? oH : oW;
                        return oA(r, t, e, i, new oK(r, t))
                    }(n, e, a, ec.get(n))) : r.push(...oA(function(t) {
                        return oT.find(e => e.test(t))
                    }(n) ?? oZ, n, e, a))
                }
            }
            return r
        }
        let oQ = Object.assign(function(t = {}) {
            let {
                scope: e,
                reduceMotion: i,
                skipAnimations: n
            } = t;
            return function(t, r, s) {
                var o;
                let a, l = [],
                    u = {};
                if (void 0 !== i && (u.reduceMotion = i), void 0 !== n && (u.skipAnimations = n), Array.isArray(t) && t.some(Array.isArray)) {
                    let i, {
                        onComplete: n,
                        ...s
                    } = r || {};
                    "function" == typeof n && (a = n), o = { ...u,
                        ...s
                    }, i = [], (function(t, {
                        defaultTransition: e = {},
                        ...i
                    } = {}, n, r) {
                        let s = e.duration || .3,
                            o = new Map,
                            a = new Map,
                            l = {},
                            u = new Map,
                            h = 0,
                            d = 0,
                            c = 0;
                        for (let i = 0; i < t.length; i++) {
                            let o = t[i];
                            if ("string" == typeof o) {
                                u.set(o, d);
                                continue
                            }
                            if (!Array.isArray(o)) {
                                u.set(o.name, oV(d, o.at, h, u));
                                continue
                            }
                            let [f, g, y = {}] = o;
                            void 0 !== y.at && (d = oV(d, y.at, h, u));
                            let v = 0,
                                x = (t, i, n, o = 0, a = 0) => {
                                    var l;
                                    let u = Array.isArray(l = t) ? l : [l],
                                        {
                                            delay: h = 0,
                                            times: p = nv(u),
                                            type: m = e.type || "keyframes",
                                            repeat: f,
                                            repeatType: g,
                                            repeatDelay: y = 0,
                                            ...x
                                        } = i,
                                        {
                                            ease: w = e.ease || "easeOut",
                                            duration: b
                                        } = i,
                                        T = "function" == typeof h ? h(o, a) : h,
                                        k = u.length,
                                        S = en(m) ? m : r ?.[m || "keyframes"];
                                    if (k <= 2 && S) {
                                        let t = 100;
                                        2 === k && oB(u) && (t = Math.abs(u[1] - u[0]));
                                        let i = { ...e,
                                            ...x
                                        };
                                        void 0 !== b && (i.duration = tz(b));
                                        let n = iG(i, t, S);
                                        w = n.ease, b = n.duration
                                    }
                                    b ?? (b = s);
                                    let A = d + T;
                                    1 === p.length && 0 === p[0] && (p[1] = 1);
                                    let P = p.length - u.length;
                                    if (P > 0 && ny(p, P), 1 === u.length && u.unshift(null), f && te(`Sequence segments can't repeat ${f} times — ignoring repeat option. Use a value below 20 or apply repeat at the sequence level instead.`), f && f < 20) {
                                        let t = b > 0 ? y / b : 0;
                                        b = b * (f + 1) + y * f;
                                        let e = [...u],
                                            i = [...p],
                                            n = [...w = Array.isArray(w) ? [...w] : [w]],
                                            r = "reverse" === g || "mirror" === g,
                                            s = e,
                                            o = n;
                                        r && (s = [...e].reverse(), "reverse" === g && (o = [...n].reverse().map(t => "function" == typeof t ? ns(t) : t)));
                                        for (let a = 0; a < f; a++) {
                                            let l = r && a % 2 == 0,
                                                h = l ? s : e,
                                                d = l ? o : n,
                                                c = (a + 1) * (1 + t);
                                            t > 0 && (u.push(u[u.length - 1]), p.push(c), w.push("linear")), u.push(...h);
                                            for (let t = 0; t < h.length; t++) p.push(i[t] + c), w.push(0 === t ? "linear" : oE(d, t - 1))
                                        }! function(t, e, i = 0) {
                                            let n = e + 1 + e * i;
                                            for (let e = 0; e < t.length; e++) t[e] = t[e] / n
                                        }(p, f, t)
                                    }
                                    let M = A + b;
                                    ! function(t, e, i, n, r, s) {
                                        for (let e = 0; e < t.length; e++) {
                                            let i = t[e];
                                            i.at > r && i.at < s && (tq(t, i), e--)
                                        }
                                        for (let o = 0; o < e.length; o++) t.push({
                                            value: e[o],
                                            at: ez(r, s, n[o]),
                                            easing: oE(i, o)
                                        })
                                    }(n, u, w, p, A, M), v = Math.max(T + b, v), c = Math.max(M, c)
                                };
                            if (Z(f)) x(g, y, oX("default", oR(f, a)));
                            else {
                                let t = oj(f, g, n, l),
                                    e = t.length;
                                for (let i = 0; i < e; i++) {
                                    let n = oR(t[i], a);
                                    for (let t in g) {
                                        var p, m;
                                        x(g[t], (p = y, m = t, p && p[m] ? { ...p,
                                            ...p[m]
                                        } : { ...p
                                        }), oX(t, n), i, e)
                                    }
                                }
                            }
                            h = d, d += v
                        }
                        return a.forEach((t, n) => {
                            for (let r in t) {
                                let s = t[r];
                                s.sort(oI);
                                let a = [],
                                    l = [],
                                    u = [];
                                for (let t = 0; t < s.length; t++) {
                                    let {
                                        at: e,
                                        value: i,
                                        easing: n
                                    } = s[t];
                                    a.push(i), l.push(nf(0, c, e)), u.push(n || "easeOut")
                                }
                                0 !== l[0] && (l.unshift(0), a.unshift(a[0]), u.unshift("easeInOut")), 1 !== l[l.length - 1] && (l.push(1), a.push(null)), o.has(n) || o.set(n, {
                                    keyframes: {},
                                    transition: {}
                                });
                                let h = o.get(n);
                                h.keyframes[r] = a;
                                let {
                                    type: d,
                                    ...p
                                } = e;
                                h.transition[r] = { ...p,
                                    duration: c,
                                    ease: u,
                                    times: l,
                                    ...i
                                }
                            }
                        }), o
                    })(t.map(t => {
                        if (Array.isArray(t) && "function" == typeof t[0]) {
                            let e = t[0],
                                i = ed(0);
                            return (i.on("change", e), 1 === t.length) ? [i, [0, 1]] : 2 === t.length ? [i, [0, 1], t[1]] : [i, t[1], t[2]]
                        }
                        return t
                    }), o, e, {
                        spring: i8
                    }).forEach(({
                        keyframes: t,
                        transition: e
                    }, n) => {
                        i.push(...oJ(n, t, e))
                    }), l = i
                } else {
                    let {
                        onComplete: i,
                        ...n
                    } = s || {};
                    "function" == typeof i && (a = i), l = oJ(t, r, { ...u,
                        ...n
                    }, e)
                }
                let h = new oC(l);
                return a && h.finished.then(a), e && (e.animations.push(h), h.finished.then(() => {
                    tq(e.animations, h)
                })), h
            }
        }(), {
            addEffect: function(t) {
                ti("function" == typeof t.test && t.read), ok(t), oT.unshift(t)
            },
            removeEffect: ok
        });
        var sK = sK;

        function o0(t, e, i, n, r) {
            let s = i / 1e3,
                o = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
                a = e / 180,
                l = n + 60 * s - (n + 200 * s) * o,
                u = 26 * s * (1 - .6 * o),
                h = `M0 ${n+10} L0 ${l}`;
            for (let t = 0; t <= i; t += 25 * s) h += ` L${t.toFixed(1)} ${(l+Math.sin(t/(90*s)+a)*u+Math.sin(t/(37*s)-1.3*a)*u*.35).toFixed(1)}`;
            for (let t of (h += ` L${i} ${n+10}Z`, r)) {
                let e = Math.max(0, Math.min(1, (o - t.d) * 3)) * (1 - o) * 1.4;
                if (e <= 0) continue;
                let i = l - t.h * e,
                    n = t.w / 2;
                h += ` M${t.x-n} ${l+20*s} L${t.x-n} ${i+n} A${n} ${n} 0 0 1 ${t.x+n} ${i+n} L${t.x+n} ${l+20*s}Z`
            }
            return h
        }

        function o1(t, e = "#e9e8e4") {
            let i = [1, 3, 5].map(t => parseInt(e.slice(t, t + 2), 16)),
                n = [1, 3, 5].map(e => parseInt(t.slice(e, e + 2), 16));
            return `rgb(${i.map((t,e)=>Math.round(.91*t+.09*n[e])).join(",")})`
        }
        var o5 = t.i(98428);
        let o3 = "(max-width: 640px) 80vw, 50vh";

        function o2(t) {
            let e = or[t];
            return (0, o5.getImageProps)({
                src: t,
                width: e.width,
                height: e.height,
                sizes: o3,
                alt: ""
            }).props
        }
        let o4 = new Map,
            o8 = new Map;

        function o6(t) {
            let e = o4.get(t);
            if (!e) {
                let i = o2(t),
                    n = new window.Image;
                i.sizes && (n.sizes = i.sizes), i.srcSet && (n.srcset = i.srcSet), n.src = i.src, e = n.decode().catch(() => {}).then(() => {
                    let e = n.currentSrc || i.src;
                    return o8.set(t, e), e
                }), o4.set(t, e)
            }
            return e
        }

        function o9() {
            let t = () => op.forEach(t => (t.colourways ?? [t]).forEach(t => o6(t.front))),
                e = window;
            e.requestIdleCallback ? e.requestIdleCallback(t, {
                timeout: 3e3
            }) : setTimeout(t, 1200)
        }
        let o7 = t => (or[t].loopInnerTopY + or[t].loopInnerBottomY) / 2,
            at = t => (or[t].shoulderX0 + or[t].shoulderX1) / 2;

        function ae(t) {
            let e = or[t],
                i = od[t];
            return i ? {
                ref: i.ref,
                x: at(i.ref) - at(t) * i.sx,
                y: o7(i.ref) - o7(t) * i.sy,
                w: e.width * i.sx,
                h: e.height * i.sy
            } : {
                ref: t,
                x: 0,
                y: 0,
                w: e.width,
                h: e.height
            }
        }

        function ai(t) {
            let e = ae(t),
                i = or[e.ref],
                n = `(var(--fiw) * ${os[e.ref]??1} / ${i.width})`,
                r = e.x - i.loopCenterX,
                s = e.y - o7(e.ref);
            return {
                style: {
                    left: `calc(${n} * ${r})`,
                    top: `calc(${n} * ${s})`,
                    width: `calc(${n} * ${e.w})`,
                    height: `calc(${n} * ${e.h})`
                },
                axisX: -r / e.w
            }
        }

        function an(t) {
            let e = ae(t),
                i = or[e.ref],
                n = e.h / or[t].height;
            return (e.y + or[t].garmentBottomY * n - o7(e.ref)) * (os[e.ref] ?? 1) / i.width
        }

        function ar(t, e = !1) {
            let i = ae(t),
                n = or[i.ref],
                r = or[t],
                s = i.w / r.width,
                o = (os[i.ref] ?? 1) / n.width;
            return e ? (n.loopCenterX - (i.x + r.garmentX0 * s)) * o : (i.x + r.garmentX1 * s - n.loopCenterX) * o
        }
        let as = t => Math.sin(t * Math.PI / 180);

        function ao({
            src: t,
            opacity: e,
            turn: i,
            bodyScale: n,
            back: s,
            preload: o
        }) {
            let a = or[t] || defaultGeom,
                isCustom = (typeof t === "string" && (t.includes("upload") || !t.startsWith("/products/"))),
                {
                    style: l,
                    axisX: u
                } = ai(t),
                h = `${(a.neckY/a.height*100).toFixed(3)}%`,
                d = `url(${o2(t).src})`,
                c = oe(i, t => `linear-gradient(${as(t)>0?"to right":"to left"},rgba(0,0,0,0) 15%,rgba(10,8,6,.75))`),
                p = oe(i, t => Math.min(1, 1.1 * Math.abs(as(t)))),
                m = (0, r.jsx)(sK.Image, {
                    src: t,
                    width: a.width,
                    height: a.height,
                    sizes: o3,
                    alt: "",
                    preload: o,
                    loading: "eager",
                    draggable: !1
                });
            return (0, r.jsxs)(sG.div, {
                className: "fg-layer fg-face" + (isCustom ? " fg-custom" : ""),
                style: { ...l,
                    opacity: e,
                    rotateY: 180 * !!s,
                    originX: u
                },
                children: [
                    (0, r.jsx)("div", {
                        className: "fg-piece",
                        style: {
                            clipPath: isCustom ? void 0 : `inset(0 0 calc(100% - ${h}) 0)`
                        },
                        children: m
                    }),
                    !isCustom && (0, r.jsx)(sG.div, {
                        className: "fg-piece",
                        style: {
                            clipPath: `inset(${h} 0 0 0)`,
                            scale: n,
                            originX: a.loopCenterX / a.width,
                            originY: a.neckY / a.height
                        },
                        children: m
                    }),
                    !isCustom && (0, r.jsx)(sG.div, {
                        className: "fg-shade",
                        style: {
                            background: c,
                            opacity: p,
                            WebkitMaskImage: d,
                            maskImage: d
                        }
                    })
                ]
            })
        }

        function aa({
            from: t,
            to: e,
            back: i,
            onStart: n,
            onDone: o
        }) {
            let a = ae(e).ref,
                l = or[a],
                {
                    style: u,
                    axisX: h
                } = ai(a),
                d = (0, s.useId)().replace(/:/g, ""),
                c = (0, s.useRef)(null),
                p = (0, s.useRef)(null),
                m = (0, s.useRef)({
                    onStart: n,
                    onDone: o
                });
            (0, s.useEffect)(() => {
                m.current = {
                    onStart: n,
                    onDone: o
                }
            }, [n, o]);
            let [f] = (0, s.useState)(() => o8.get(t) ?? o2(t).src), [g, y] = (0, s.useState)(() => o8.get(e) ?? null), [v, x] = (0, s.useState)({
                from: !1,
                to: !1
            });
            (0, s.useEffect)(() => {
                if (g) return;
                let t = !1;
                return o6(e).then(e => {
                    t || y(e)
                }), () => {
                    t = !0
                }
            }, [e, g]), (0, s.useEffect)(() => {
                v.from && v.to && m.current.onStart()
            }, [v.from, v.to]), (0, s.useEffect)(() => {
                let t, e = 0,
                    i = (t = l.width / 1e3, [...Array(7)].map((e, i) => ({
                        x: (90 + 130 * i + 60 * Math.random()) * t,
                        w: (16 + 22 * Math.random()) * t,
                        h: (40 + 90 * Math.random()) * t,
                        d: .25 * Math.random()
                    }))),
                    n = t => {
                        c.current ?.setAttribute("d", t), p.current ?.setAttribute("d", t)
                    },
                    r = performance.now(),
                    s = t => {
                        let o = Math.min(1, (t - r) / 1150);
                        n(o0(o, t, l.width, l.height, i)), o < 1 ? e = requestAnimationFrame(s) : m.current.onDone()
                    };
                return n(o0(0, r, l.width, l.height, i)), e = requestAnimationFrame(s), () => cancelAnimationFrame(e)
            }, [l.width, l.height]);
            let w = t => {
                    let e = ae(t);
                    return {
                        x: e.x,
                        y: e.y,
                        width: e.w,
                        height: e.h
                    }
                },
                b = `M0 ${l.height+10}Z`;
            return (0, r.jsx)("div", {
                className: "fg-layer fg-face",
                style: { ...u,
                    transform: i ? "rotateY(180deg)" : void 0,
                    transformOrigin: `${100*h}% 50%`
                },
                children: (0, r.jsxs)("svg", {
                    className: "fg-dye",
                    viewBox: `0 0 ${l.width} ${l.height}`,
                    "aria-hidden": "true",
                    children: [(0, r.jsxs)("defs", {
                        children: [(0, r.jsx)("mask", {
                            id: `new-${d}`,
                            maskUnits: "userSpaceOnUse",
                            x: -l.width,
                            y: -l.height,
                            width: 3 * l.width,
                            height: 3 * l.height,
                            children: (0, r.jsx)("path", {
                                ref: c,
                                fill: "#fff",
                                d: b
                            })
                        }), (0, r.jsxs)("mask", {
                            id: `old-${d}`,
                            maskUnits: "userSpaceOnUse",
                            x: -l.width,
                            y: -l.height,
                            width: 3 * l.width,
                            height: 3 * l.height,
                            children: [(0, r.jsx)("rect", {
                                x: -l.width,
                                y: -l.height,
                                width: 3 * l.width,
                                height: 3 * l.height,
                                fill: "#fff"
                            }), (0, r.jsx)("path", {
                                ref: p,
                                fill: "#000",
                                d: b
                            })]
                        })]
                    }), (0, r.jsx)("image", {
                        href: f,
                        ...w(t),
                        preserveAspectRatio: "none",
                        mask: `url(#old-${d})`,
                        onLoad: () => x(t => ({ ...t,
                            from: !0
                        }))
                    }), g && (0, r.jsx)("image", {
                        href: g,
                        ...w(e),
                        preserveAspectRatio: "none",
                        mask: `url(#new-${d})`,
                        onLoad: () => x(t => ({ ...t,
                            to: !0
                        }))
                    })]
                })
            })
        }

        function al({
            view: t,
            phase: e,
            angle: i,
            swing: n,
            bodyScale: o,
            dye: a,
            onDyeDone: l,
            moving: u
        }) {
            let h = oe([e, i], ([t, e]) => t <= 90 ? t : t - 180 + e),
                d = oe(e, t => +(t <= 90)),
                c = oe(e, t => +(t > 90)),
                p = oe(e, () => 0),
                [m, f] = (0, s.useState)(null),
                g = !!a && m === a.key;
            return (0, r.jsx)(sG.div, {
                className: "fg",
                style: {
                    rotateZ: n,
                    willChange: u ? "transform" : "auto"
                },
                children: (0, r.jsxs)(sG.div, {
                    className: "fg-card",
                    style: {
                        rotateY: h,
                        willChange: u ? "transform" : "auto"
                    },
                    children: [(0, r.jsx)(ao, {
                        src: t.side,
                        opacity: d,
                        turn: h,
                        bodyScale: o
                    }, t.side), (0, r.jsx)(ao, {
                        src: t.front,
                        opacity: g && !a.back ? p : c,
                        turn: h,
                        bodyScale: o,
                        preload: !0
                    }, t.front), t.back && (0, r.jsx)(ao, {
                        src: t.back,
                        opacity: g && a.back ? p : c,
                        turn: h,
                        bodyScale: o,
                        back: !0
                    }, t.back), a && l && (0, r.jsx)(aa, {
                        from: a.from,
                        to: a.to,
                        back: a.back,
                        onStart: () => f(a.key),
                        onDone: l
                    }, a.key)]
                })
            })
        }

        function au({
            name: t,
            url: e,
            face: i,
            animateFace: n,
            hasBack: o,
            onFace: a
        }) {
            let l = "back" === i,
                u = (0, s.useRef)(null);
            return (0, s.useLayoutEffect)(() => {
                let t = u.current;
                if (!t) return;
                let e = () => {
                    if (t.style.fontSize = "", !window.matchMedia("(min-width: 641px)").matches) return;
                    let e = t.clientWidth,
                        i = t.scrollWidth;
                    i > e && (t.style.fontSize = `${Math.max(18,Math.floor(24*e/i))}px`)
                };
                return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e)
            }, [t]), (0, r.jsxs)("div", {
                className: "info",
                children: [(0, r.jsxs)("div", {
                    className: `seg${n?" seg-animate":""}`,
                    role: "group",
                    "aria-label": "Show front or back",
                    style: o ? void 0 : {
                        visibility: "hidden"
                    },
                    "aria-hidden": !o,
                    children: [(0, r.jsx)("span", {
                        className: "seg-knob",
                        style: {
                            transform: l ? "translateX(100%)" : "translateX(0)"
                        }
                    }), (0, r.jsx)("button", {
                        type: "button",
                        className: l ? "" : "lit",
                        "aria-pressed": !l,
                        onClick: () => a(!1),
                        tabIndex: o ? void 0 : -1,
                        children: "FRONT"
                    }), (0, r.jsx)("button", {
                        type: "button",
                        className: l ? "lit" : "",
                        "aria-pressed": l,
                        onClick: () => a(!0),
                        tabIndex: o ? void 0 : -1,
                        children: "BACK"
                    })]
                }), (0, r.jsx)("h2", {
                    className: "info-name",
                    ref: u,
                    children: t
                }), (0, r.jsx)("a", {
                    className: "info-cta",
                    href: "#",
                    "aria-label": `Order ${t}`,
                    children: "ثبت سفارش"
                })]
            })
        }

        function ah({
            ways: t,
            active: e,
            onPick: i
        }) {
            return (0, r.jsx)("div", {
                className: "tags",
                children: t.map((t, n) => (0, r.jsxs)("div", {
                    className: `tagwrap${n===e?" on":""}`,
                    style: {
                        animationDelay: `${-(1.1*n)}s`
                    },
                    children: [(0, r.jsx)("div", {
                        className: "string",
                        style: {
                            height: `calc(var(--tag-string) + ${n} * var(--tag-step))`
                        }
                    }), (0, r.jsx)("button", {
                        type: "button",
                        className: "tag-hit",
                        "aria-label": `Colour: ${t.label}`,
                        "aria-pressed": n === e,
                        onClick: () => i(n),
                        children: (0, r.jsx)("span", {
                            className: "tag",
                            style: {
                                "--c": t.hex,
                                "--fgc": function(t) {
                                    let [e, i, n] = [1, 3, 5].map(e => parseInt(t.slice(e, e + 2), 16));
                                    return .299 * e + .587 * i + .114 * n > 150 ? "#151513" : "#ecebe6"
                                }(t.hex)
                            },
                            "aria-hidden": "true",
                            children: (0, r.jsx)("span", {
                                className: "tag-face",
                                children: t.label
                            })
                        })
                    })]
                }, t.label))
            })
        }
        let ad = {
                type: "spring",
                stiffness: 70,
                damping: 15,
                mass: 1
            },
            ac = {
                duration: .5,
                ease: "easeInOut"
            };

        function ap({
            dir: t
        }) {
            return (0, r.jsx)("svg", {
                width: "18",
                height: "18",
                viewBox: "0 0 18 18",
                "aria-hidden": "true",
                style: {
                    transform: "l" === t ? "scaleX(-1)" : void 0
                },
                children: (0, r.jsx)("path", {
                    d: "M3 9h11.5M10 4.5 14.5 9 10 13.5",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.25",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                })
            })
        }
        let am = t => Math.max(an(t.front), t.back ? an(t.back) : 0),
            af = Math.max(...op.flatMap(t => (t.colourways ?? [t]).map(am))),
            ag = Math.max(...op.filter(t => t.colourways).flatMap(t => t.colourways.flatMap(t => [ar(t.front), t.back ? ar(t.back, !0) : 0]))),
            ay = (0, s.forwardRef)(function({
                start: t,
                origin: e,
                getOrigin: i,
                onIndex: n,
                onTint: o,
                onCloseStart: a,
                onClosed: l
            }, u) {
                let h = s8(),
                    [d, c] = (0, s.useState)(t),
                    [p, m] = (0, s.useState)(0),
                    [f, g] = (0, s.useState)(null),
                    [y, v] = (0, s.useState)({
                        face: "front",
                        animate: !1
                    }),
                    [x, w] = (0, s.useState)(!1),
                    [b, T] = (0, s.useState)("opening"),
                    k = (0, s.useRef)("opening"),
                    S = t => {
                        k.current = t, T(t)
                    },
                    A = op[d],
                    P = A.colourways ?.[p],
                    M = P ?? A,
                    C = s3(0),
                    E = s3(0),
                    Y = s3(1),
                    j = s3(0),
                    V = s3(1),
                    I = s3(180 * !!e.hovered),
                    R = s3(0),
                    X = s3(0),
                    D = s3(e.hovered ? 1.12 : 1),
                    {
                        springTo: B,
                        stop: L
                    } = oy(R, X, h),
                    O = (0, s.useRef)(null),
                    $ = (0, s.useRef)(!1),
                    F = (0, s.useRef)([]),
                    N = (0, s.useCallback)(t => {
                        let e = O.current,
                            i = e.offsetParent.getBoundingClientRect(),
                            n = i.left + e.offsetLeft,
                            r = i.top + e.offsetTop,
                            s = parseFloat(getComputedStyle(e).getPropertyValue("--fiw-px")) || 1;
                        return {
                            dx: t.x - n,
                            dy: t.y + t.rod / 2 - r,
                            k: t.iw / s
                        }
                    }, []),
                    _ = (0, s.useCallback)((t, e) => {
                        F.current.forEach(t => t.stop());
                        let i = h ? {
                            duration: 0
                        } : ad;
                        F.current = [oQ(C, t.x, i), oQ(E, t.y, i), oQ(Y, t.s, i), oQ(D, t.body, i), oQ(I, t.phase, h ? {
                            duration: 0
                        } : {
                            type: "spring",
                            stiffness: 60,
                            damping: 14
                        })], Promise.all(F.current.map(t => t.finished)).then(e, () => {})
                    }, [h, C, E, Y, D, I]),
                    U = (0, s.useRef)(!1);
                (0, s.useEffect)(() => {
                    if (U.current) return;
                    U.current = !0;
                    let {
                        dx: t,
                        dy: i,
                        k: n
                    } = N(e);
                    if (h) {
                        V.set(0), I.set(180), D.set(1), oQ(V, 1, {
                            duration: .3
                        }).finished.then(() => S("open"));
                        return
                    }
                    C.set(t), E.set(i), Y.set(n), _({
                        x: 0,
                        y: 0,
                        s: 1,
                        phase: 180,
                        body: 1
                    }, () => S("open"))
                }, []), (0, s.useEffect)(() => n(d), [d, n]), (0, s.useEffect)(() => (function(t, e = !1) {
                    let i = op.length;
                    for (let r of e ? [t, (t + 1) % i, (t - 1 + i) % i] : [t]) {
                        var n;
                        ((n = op[r]).colourways ?? [n]).flatMap(t => [t.front, t.back]).filter(t => !!t).forEach(o6)
                    }
                })(d, !0), [d]), (0, s.useEffect)(() => o(P ? o1(P.hex) : null), [P, o]);
                let W = (0, s.useCallback)(() => {
                    if ("closing" === k.current) return;
                    S("closing"), L(), g(null), a(), o(null);
                    let t = i(d);
                    if (h || !t) return void oQ(V, 0, {
                        duration: h ? .25 : .2
                    }).finished.then(l);
                    B(0, {
                        kick: 2
                    });
                    let {
                        dx: e,
                        dy: n,
                        k: r
                    } = N(t);
                    _({
                        x: e,
                        y: n,
                        s: r,
                        phase: 0,
                        body: 1
                    }, l)
                }, [i, d, a, l, o, h, B, L, N, _, V]);
                (0, s.useImperativeHandle)(u, () => ({
                    close: W
                }), [W]);
                let z = (0, s.useCallback)(t => {
                        if ("open" !== k.current || $.current) return;
                        $.current = !0, g(null), v({
                            face: "front",
                            animate: !1
                        });
                        let e = (d + t + op.length) % op.length;
                        if (h) return void oQ(V, 0, {
                            duration: .15
                        }).finished.then(() => {
                            c(e), m(0), R.set(0), oQ(V, 1, {
                                duration: .2
                            }).finished.then(() => $.current = !1)
                        });
                        let i = window.innerWidth;
                        oQ(j, -t * i * .35, {
                            type: "spring",
                            stiffness: 140,
                            damping: 22
                        }), B(180 * Math.round(R.get() / 180) + (t > 0 ? -90 : 90), {
                            eps: 6,
                            onDone: () => {
                                c(e), m(0), R.set(t > 0 ? 90 : -90), j.set(t * i * .35), oQ(j, 0, {
                                    type: "spring",
                                    stiffness: 140,
                                    damping: 22
                                }), B(0, {
                                    kick: 4 * t,
                                    eps: 4,
                                    onDone: () => $.current = !1
                                })
                            }
                        })
                    }, [d, h, B, R, j, V]),
                    H = (0, s.useCallback)(t => {
                        let e;
                        if (t === ((e = (R.get() % 360 + 360) % 360) > 90 && e < 270)) return Promise.resolve();
                        L();
                        let i = R.get() + 180;
                        return h ? (R.set(i), Promise.resolve()) : (w(!0), oQ(R, i, ac).finished.then(() => {
                            w(!1), B(i, {
                                kick: 3
                            })
                        }))
                    }, [R, h, B, L]),
                    q = (0, s.useCallback)(t => {
                        "open" === k.current && !$.current && M.back && ($.current = !0, v({
                            face: t ? "back" : "front",
                            animate: !0
                        }), H(t).then(() => $.current = !1))
                    }, [M.back, H]),
                    G = (0, s.useCallback)(t => {
                        if (!A.colourways || t === p || $.current || "open" !== k.current) return;
                        let e = A.colourways,
                            i = e[t],
                            n = "back" === y.face && !!e[p].back && !!i.back;
                        try { o(o1(i.hex)); } catch(err) {}
                        m(t);
                        if (h) return;
                        $.current = !0;
                        g({
                            from: n ? e[p].back : e[p].front,
                            to: n ? i.back : i.front,
                            back: n,
                            toIndex: t,
                            key: Date.now()
                        });
                        B(R.get(), {
                            kick: 2.5
                        });
                        setTimeout(() => {
                            $.current = !1;
                            g(null);
                        }, 600);
                    }, [A.colourways, p, R, B, o, h, y.face]),
                    K = (0, s.useCallback)(() => {
                        if (!f) return;
                        m(f.toIndex);
                        let t = f.key;
                        setTimeout(() => {
                            g(e => e && e.key === t ? null : e), $.current = !1
                        }, 160)
                    }, [f]);
                (0, s.useEffect)(() => {
                    let t = t => {
                        "Escape" === t.key && W(), "ArrowRight" === t.key && z(1), "ArrowLeft" === t.key && z(-1)
                    };
                    return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t)
                }, [W, z]);
                let Z = (0, s.useRef)(null),
                    J = t => Z.current = {
                        x: t.clientX,
                        y: t.clientY
                    },
                    Q = t => {
                        let e = Z.current;
                        if (Z.current = null, !e) return !1;
                        let i = t.clientX - e.x;
                        return !!(Math.abs(i) > 50 && Math.abs(i) > Math.abs(t.clientY - e.y)) && (z(i < 0 ? 1 : -1), !0)
                    },
                    tt = "open" === b;
                return (0, r.jsxs)("div", {
                    className: "focus",
                    "data-status": b,
                    style: {
                        "--stage": af,
                        "--tag-x": ag
                    },
                    children: [(0, r.jsx)("div", {
                        className: "focus-backdrop",
                        onPointerDown: J,
                        onPointerUp: t => {
                            Q(t) || W()
                        }
                    }), (0, r.jsx)(sG.div, {
                        className: "focus-anchor",
                        ref: O,
                        style: {
                            x: C,
                            y: E,
                            scale: Y,
                            opacity: V,
                            willChange: "open" === b ? "auto" : "transform"
                        },
                        children: (0, r.jsxs)(sG.div, {
                            className: "focus-slide",
                            style: {
                                x: j
                            },
                            children: [(0, r.jsx)(al, {
                                view: M,
                                phase: I,
                                angle: R,
                                swing: X,
                                bodyScale: D,
                                dye: f,
                                onDyeDone: K,
                                moving: "open" !== b || x
                            }), (0, r.jsx)("div", {
                                className: "focus-garment-area",
                                onPointerDown: J,
                                onPointerUp: Q
                            }), A.colourways && (0, r.jsx)(sG.div, {
                                className: "focus-tags-wrap",
                                initial: !1,
                                animate: {
                                    opacity: +!!tt
                                },
                                transition: {
                                    duration: .3
                                },
                                children: (0, r.jsx)(ah, {
                                    ways: A.colourways,
                                    active: f ? f.toIndex : p,
                                    onPick: G
                                })
                            })]
                        })
                    }), (0, r.jsx)(sG.button, {
                        type: "button",
                        className: "focus-arrow l",
                        "aria-label": "Previous piece",
                        onClick: () => z(-1),
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: +!!tt
                        },
                        style: {
                            pointerEvents: tt ? "auto" : "none"
                        },
                        children: (0, r.jsx)(ap, {
                            dir: "l"
                        })
                    }), (0, r.jsx)(sG.button, {
                        type: "button",
                        className: "focus-arrow r",
                        "aria-label": "Next piece",
                        onClick: () => z(1),
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: +!!tt
                        },
                        style: {
                            pointerEvents: tt ? "auto" : "none"
                        },
                        children: (0, r.jsx)(ap, {
                            dir: "r"
                        })
                    }), (0, r.jsx)(sG.div, {
                        className: "focus-info",
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: +!!tt
                        },
                        transition: {
                            duration: .3
                        },
                        children: (0, r.jsx)(au, {
                            name: A.name,
                            url: A.url,
                            face: y.face,
                            animateFace: y.animate,
                            hasBack: !!M.back,
                            onFace: q
                        })
                    })]
                })
            });
        t.s(["default", 0, function() {
            let [t, e] = (0, s.useState)(null), [i, n] = (0, s.useState)(!1), [o, a] = (0, s.useState)(null), [l, u] = (0, s.useState)(null), h = (0, s.useRef)(null);
            (0, s.useEffect)(() => ("complete" === document.readyState ? o9() : window.addEventListener("load", o9, {
                once: !0
            }), () => window.removeEventListener("load", o9)), []);
            let d = (0, s.useCallback)((t, i) => {
                    e({
                        start: t,
                        origin: i,
                        key: Date.now()
                    }), a(t), n(!0)
                }, []),
                c = (0, s.useCallback)(t => ow(t), []),
                p = (0, s.useCallback)(() => n(!1), []),
                m = (0, s.useCallback)(() => {
                    e(null), a(null)
                }, []);
            return (0, r.jsxs)("div", {
                className: "wall relative h-dvh w-full overflow-hidden",
                style: l ? {
                    backgroundColor: l
                } : void 0,
                children: [(0, r.jsx)(sQ, {
                    focus: i,
                    onClose: () => h.current ?.close()
                }), (0, r.jsxs)("main", {
                    children: [(0, r.jsx)("h1", {
                        className: "sr-only",
                        children: "Snug Wrld"
                    }), (0, r.jsx)(sG.div, {
                        className: "absolute inset-0",
                        initial: !1,
                        animate: i ? {
                            filter: "blur(8px)",
                            opacity: .25
                        } : {
                            filter: "blur(0px)",
                            opacity: 1
                        },
                        transition: {
                            duration: .5,
                            ease: "easeOut"
                        },
                        children: (0, r.jsx)(ob, {
                            onSelect: d,
                            hiddenIndex: o,
                            paused: !!t
                        })
                    }), (0, r.jsx)(s1, {
                        hidden: !!t
                    }), t && (0, r.jsx)(ay, {
                        ref: h,
                        start: t.start,
                        origin: t.origin,
                        getOrigin: c,
                        onIndex: a,
                        onTint: u,
                        onCloseStart: p,
                        onClosed: m
                    }, t.key)]
                }), (0, r.jsx)(s0, {})]
            })
        }], 27475)
    }, 85437, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "Image", {
            enumerable: !0,
            get: function() {
                return x
            }
        });
        let n = t.r(55682),
            r = t.r(90809),
            s = t.r(43476),
            o = r._(t.r(71645)),
            a = n._(t.r(74080)),
            l = n._(t.r(25633)),
            u = t.r(8927),
            h = t.r(65856),
            d = t.r(49381),
            c = n._(t.r(1948)),
            p = t.r(18581);

        function m(t, e, i, n, r, s, o) {
            let a = t ?.src;
            t && t["data-loaded-src"] !== a && (t["data-loaded-src"] = a, ("decode" in t ? t.decode() : Promise.resolve()).catch(() => {}).then(() => {
                if (t.parentElement && t.isConnected) {
                    if ("empty" !== e && r(!0), i ?.current) {
                        let e = new Event("load");
                        Object.defineProperty(e, "target", {
                            writable: !1,
                            value: t
                        });
                        let n = !1,
                            r = !1;
                        i.current({ ...e,
                            nativeEvent: e,
                            currentTarget: t,
                            target: t,
                            isDefaultPrevented: () => n,
                            isPropagationStopped: () => r,
                            persist: () => {},
                            preventDefault: () => {
                                n = !0, e.preventDefault()
                            },
                            stopPropagation: () => {
                                r = !0, e.stopPropagation()
                            }
                        })
                    }
                    n ?.current && n.current(t)
                }
            }))
        }

        function f(t) {
            return o.use ? {
                fetchPriority: t
            } : {
                fetchpriority: t
            }
        }
        "u" < typeof window && (globalThis.__NEXT_IMAGE_IMPORTED = !0);
        let g = "u" < typeof window ? o.useEffect : o.useLayoutEffect,
            y = (0, o.forwardRef)(({
                src: t,
                srcSet: e,
                sizes: i,
                height: n,
                width: r,
                decoding: a,
                className: l,
                style: u,
                fetchPriority: h,
                placeholder: d,
                loading: c,
                unoptimized: y,
                fill: v,
                onLoadRef: x,
                onLoadingCompleteRef: w,
                setBlurComplete: b,
                setShowAltText: T,
                sizesInput: k,
                onLoad: S,
                onError: A,
                ...P
            }, M) => {
                let C = (0, o.useRef)(!1),
                    E = (0, o.useRef)(null);
                g(() => {
                    let {
                        current: t
                    } = C, {
                        current: e
                    } = E;
                    t || null === e || (A && (e.src = e.src), e.complete && m(e, d, x, w, b, y, k), C.current = !0)
                }, [t, d, x, w, A, y, k]);
                let Y = (0, p.useMergedRef)(M, E);
                return (0, s.jsx)("img", { ...P,
                    ...f(h),
                    loading: c,
                    width: r,
                    height: n,
                    decoding: a,
                    "data-nimg": v ? "fill" : "1",
                    className: l,
                    style: u,
                    sizes: i,
                    srcSet: e,
                    src: t,
                    ref: Y,
                    onLoad: t => {
                        m(t.currentTarget, d, x, w, b, y, k)
                    },
                    onError: t => {
                        T(!0), "empty" !== d && b(!0), A && A(t)
                    }
                })
            });

        function v({
            isAppRouter: t,
            imgAttributes: e
        }) {
            let i = {
                as: "image",
                imageSrcSet: e.srcSet,
                imageSizes: e.sizes,
                crossOrigin: e.crossOrigin,
                referrerPolicy: e.referrerPolicy,
                ...f(e.fetchPriority)
            };
            return t && a.default.preload ? (a.default.preload(e.src, i), null) : (0, s.jsx)(l.default, {
                children: (0, s.jsx)("link", {
                    rel: "preload",
                    href: e.srcSet ? void 0 : e.src,
                    ...i
                }, "__nimg-" + e.src + e.srcSet + e.sizes)
            })
        }
        let x = (0, o.forwardRef)((t, e) => {
            let i = (0, o.useContext)(h.RouterContext),
                n = (0, d.useImageConfig)(),
                {
                    onLoad: r,
                    onLoadingComplete: a
                } = t,
                l = (0, o.useRef)(r);
            (0, o.useEffect)(() => {
                l.current = r
            }, [r]);
            let p = (0, o.useRef)(a);
            (0, o.useEffect)(() => {
                p.current = a
            }, [a]);
            let [m, f] = (0, o.useState)(!1), [g, x] = (0, o.useState)(!1), {
                props: w,
                meta: b
            } = (0, u.getImgProps)(t, {
                defaultLoader: c.default,
                imgConf: n,
                blurComplete: m,
                showAltText: g
            });
            return (0, s.jsxs)(s.Fragment, {
                children: [(0, s.jsx)(y, { ...w,
                    unoptimized: b.unoptimized,
                    placeholder: b.placeholder,
                    fill: b.fill,
                    onLoadRef: l,
                    onLoadingCompleteRef: p,
                    setBlurComplete: f,
                    setShowAltText: x,
                    sizesInput: t.sizes,
                    ref: e
                }), b.preload ? (0, s.jsx)(v, {
                    isAppRouter: !i,
                    imgAttributes: w
                }) : null]
            })
        });
        ("function" == typeof i.default || "object" == typeof i.default && null !== i.default) && void 0 === i.default.__esModule && (Object.defineProperty(i.default, "__esModule", {
            value: !0
        }), Object.assign(i.default, i), e.exports = i.default)
    }, 49381, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "useImageConfig", {
            enumerable: !0,
            get: function() {
                return a
            }
        });
        let n = t.r(71645),
            r = t.r(87690),
            s = t.r(18556),
            o = {
                deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
                imageSizes: [32, 48, 64, 96, 128, 256, 384],
                qualities: [75],
                path: (typeof window !== "undefined" && window.STORE_BASE_PATH ? window.STORE_BASE_PATH + "_next/image" : "/_next/image"),
                loader: "default",
                dangerouslyAllowSVG: !1,
                unoptimized: !1
            };

        function a() {
            let t = (0, n.useContext)(s.ImageConfigContext);
            return (0, r.prepareImageConfig)(o, t)
        }("function" == typeof i.default || "object" == typeof i.default && null !== i.default) && void 0 === i.default.__esModule && (Object.defineProperty(i.default, "__esModule", {
            value: !0
        }), Object.assign(i.default, i), e.exports = i.default)
    }, 18581, (t, e, i) => {
        Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "useMergedRef", {
            enumerable: !0,
            get: function() {
                return r
            }
        });
        let n = t.r(71645);

        function r(t, e) {
            let i = (0, n.useRef)(null),
                r = (0, n.useRef)(null);
            return (0, n.useCallback)(n => {
                if (null === n) {
                    let t = i.current;
                    t && (i.current = null, t());
                    let e = r.current;
                    e && (r.current = null, e())
                } else t && (i.current = s(t, n)), e && (r.current = s(e, n))
            }, [t, e])
        }

        function s(t, e) {
            if ("function" != typeof t) return t.current = e, () => {
                t.current = null
            }; {
                let i = t(e);
                return "function" == typeof i ? i : () => t(null)
            }
        }("function" == typeof i.default || "object" == typeof i.default && null !== i.default) && void 0 === i.default.__esModule && (Object.defineProperty(i.default, "__esModule", {
            value: !0
        }), Object.assign(i.default, i), e.exports = i.default)
    }, 70965, (t, e, i) => {
        function n(t, e) {
            let i = t || 75;
            return e ?.qualities ?.length ? e.qualities.reduce((t, e) => Math.abs(e - i) < Math.abs(t - i) ? e : t, e.qualities[0]) : i
        }
        Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "findClosestQuality", {
            enumerable: !0,
            get: function() {
                return n
            }
        })
    }, 8927, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "getImgProps", {
            enumerable: !0,
            get: function() {
                return l
            }
        });
        let n = t.r(43369),
            r = t.r(88143),
            s = ["-moz-initial", "fill", "none", "scale-down", void 0];

        function o(t) {
            return void 0 !== t.default
        }

        function a(t) {
            return void 0 === t ? t : "number" == typeof t ? Number.isFinite(t) ? t : 0 / 0 : "string" == typeof t && /^[0-9]+$/.test(t) ? parseInt(t, 10) : 0 / 0
        }

        function l({
            src: t,
            sizes: e,
            unoptimized: i = !1,
            priority: u = !1,
            preload: h = !1,
            loading: d,
            className: c,
            quality: p,
            width: m,
            height: f,
            fill: g = !1,
            style: y,
            overrideSrc: v,
            onLoad: x,
            onLoadingComplete: w,
            placeholder: b = "empty",
            blurDataURL: T,
            fetchPriority: k,
            decoding: S = "async",
            layout: A,
            objectFit: P,
            objectPosition: M,
            lazyBoundary: C,
            lazyRoot: E,
            ...Y
        }, j) {
            var V;
            let I, R, {
                imgConf: X,
                showAltText: D,
                blurComplete: B,
                defaultLoader: L
            } = j;
            if (void 0 === L) throw Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config");
            let O = Y.loader || L;
            delete Y.loader, delete Y.srcSet;
            let $ = "__next_img_default" in O;
            if ($) {
                if ("custom" === X.loader) throw Error(`Image with src "${t}" is missing "loader" prop.
Read more: https://nextjs.org/docs/messages/next-image-missing-loader`)
            } else {
                let t = O;
                O = e => {
                    let {
                        config: i,
                        ...n
                    } = e;
                    return t(n)
                }
            }
            if (A) {
                "fill" === A && (g = !0);
                let t = {
                    intrinsic: {
                        maxWidth: "100%",
                        height: "auto"
                    },
                    responsive: {
                        width: "100%",
                        height: "auto"
                    }
                }[A];
                t && (y = { ...y,
                    ...t
                });
                let i = {
                    responsive: "100vw",
                    fill: "100vw"
                }[A];
                i && !e && (e = i)
            }
            let F = "",
                N = a(m),
                _ = a(f);
            if ((V = t) && "object" == typeof V && (o(V) || void 0 !== V.src)) {
                let e = o(t) ? t.default : t;
                if (!e.src) throw Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received ${JSON.stringify(e)}`);
                if (!e.height || !e.width) throw Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received ${JSON.stringify(e)}`);
                if (I = e.blurWidth, R = e.blurHeight, T = T || e.blurDataURL, F = e.src, !g)
                    if (N || _) {
                        if (N && !_) {
                            let t = N / e.width;
                            _ = Math.round(e.height * t)
                        } else if (!N && _) {
                            let t = _ / e.height;
                            N = Math.round(e.width * t)
                        }
                    } else N = e.width, _ = e.height
            }
            let U = !u && !h && ("lazy" === d || void 0 === d);
            (!(t = "string" == typeof t ? t : F) || t.startsWith("data:") || t.startsWith("blob:")) && (i = !0, U = !1), X.unoptimized && (i = !0), $ && !X.dangerouslyAllowSVG && t.split("?", 1)[0].endsWith(".svg") && (i = !0);
            let W = a(p),
                z = Object.assign(g ? {
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    objectFit: P,
                    objectPosition: M
                } : {}, D ? {} : {
                    color: "transparent"
                }, y),
                H = B || "empty" === b ? null : "blur" === b ? `url("data:image/svg+xml;charset=utf-8,${(0,r.getImageBlurSvg)({widthInt:N,heightInt:_,blurWidth:I,blurHeight:R,blurDataURL:T||"",objectFit:z.objectFit})}")` : `url("${b}")`,
                q = s.includes(z.objectFit) ? "fill" === z.objectFit ? "100% 100%" : "cover" : z.objectFit,
                G = H ? {
                    backgroundSize: q,
                    backgroundPosition: z.objectPosition || "50% 50%",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: H
                } : {},
                K = function({
                    config: t,
                    src: e,
                    unoptimized: i,
                    width: r,
                    quality: s,
                    sizes: o,
                    loader: a
                }) {
                    if (i) {
                        if (e.startsWith("/") && !e.startsWith("//")) {
                            let t = (0, n.getDeploymentId)();
                            if (e.includes("/_next/static/immutable") && !(0, n.getAssetToken)()) t = void 0;
                            else if (t) {
                                let i = e.indexOf("?");
                                if (-1 !== i) {
                                    let n = new URLSearchParams(e.slice(i + 1));
                                    n.get("dpl") || (n.append("dpl", t), e = e.slice(0, i) + "?" + n.toString())
                                } else e += `?dpl=${t}`
                            }
                        }
                        return {
                            src: e,
                            srcSet: void 0,
                            sizes: void 0
                        }
                    }
                    let {
                        widths: l,
                        kind: u
                    } = function({
                        deviceSizes: t,
                        allSizes: e
                    }, i, n) {
                        if (n) {
                            let i = /(^|\s)(1?\d?\d)vw/g,
                                r = [];
                            for (let t; t = i.exec(n);) r.push(parseInt(t[2]));
                            if (r.length) {
                                let i = .01 * Math.min(...r);
                                return {
                                    widths: e.filter(e => e >= t[0] * i),
                                    kind: "w"
                                }
                            }
                            return {
                                widths: e,
                                kind: "w"
                            }
                        }
                        return "number" != typeof i ? {
                            widths: t,
                            kind: "w"
                        } : {
                            widths: [...new Set([i, 2 * i].map(t => e.find(e => e >= t) || e[e.length - 1]))],
                            kind: "x"
                        }
                    }(t, r, o), h = l.length - 1;
                    return {
                        sizes: o || "w" !== u ? o : "100vw",
                        srcSet: l.map((i, n) => `${a({config:t,src:e,quality:s,width:i})} ${"w"===u?i:n+1}${u}`).join(", "),
                        src: a({
                            config: t,
                            src: e,
                            quality: s,
                            width: l[h]
                        })
                    }
                }({
                    config: X,
                    src: t,
                    unoptimized: i,
                    width: N,
                    quality: W,
                    sizes: e,
                    loader: O
                }),
                Z = U ? "lazy" : d;
            return {
                props: { ...Y,
                    loading: Z,
                    fetchPriority: k,
                    width: N,
                    height: _,
                    decoding: S,
                    className: c,
                    style: { ...z,
                        ...G
                    },
                    sizes: K.sizes,
                    srcSet: K.srcSet,
                    src: v || K.src
                },
                meta: {
                    unoptimized: i,
                    preload: h || u,
                    placeholder: b,
                    fill: g
                }
            }
        }
    }, 25633, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        });
        var n = {
            default: function() {
                return f
            },
            defaultHead: function() {
                return d
            }
        };
        for (var r in n) Object.defineProperty(i, r, {
            enumerable: !0,
            get: n[r]
        });
        let s = t.r(55682),
            o = t.r(90809),
            a = t.r(43476),
            l = o._(t.r(71645)),
            u = s._(t.r(98879)),
            h = t.r(42732);

        function d() {
            return [(0, a.jsx)("meta", {
                charSet: "utf-8"
            }, "charset"), (0, a.jsx)("meta", {
                name: "viewport",
                content: "width=device-width"
            }, "viewport")]
        }

        function c(t, e) {
            return "string" == typeof e || "number" == typeof e ? t : e.type === l.default.Fragment ? t.concat(l.default.Children.toArray(e.props.children).reduce((t, e) => "string" == typeof e || "number" == typeof e ? t : t.concat(e), [])) : t.concat(e)
        }
        let p = ["name", "httpEquiv", "charSet", "itemProp"];

        function m(t) {
            let e, i, n, r;
            return t.reduce(c, []).reverse().concat(d().reverse()).filter((e = new Set, i = new Set, n = new Set, r = {}, t => {
                let s = !0,
                    o = !1;
                if (t.key && "number" != typeof t.key && t.key.indexOf("$") > 0) {
                    o = !0;
                    let i = t.key.slice(t.key.indexOf("$") + 1);
                    e.has(i) ? s = !1 : e.add(i)
                }
                switch (t.type) {
                    case "title":
                    case "base":
                        i.has(t.type) ? s = !1 : i.add(t.type);
                        break;
                    case "meta":
                        for (let e = 0, i = p.length; e < i; e++) {
                            let i = p[e];
                            if (t.props.hasOwnProperty(i))
                                if ("charSet" === i) n.has(i) ? s = !1 : n.add(i);
                                else {
                                    let e = t.props[i],
                                        n = r[i] || new Set;
                                    ("name" !== i || !o) && n.has(e) ? s = !1 : (n.add(e), r[i] = n)
                                }
                        }
                }
                return s
            })).reverse().map((t, e) => {
                let i = t.key || e;
                return l.default.cloneElement(t, {
                    key: i
                })
            })
        }
        let f = function({
            children: t
        }) {
            let e = (0, l.useContext)(h.HeadManagerContext);
            return (0, a.jsx)(u.default, {
                reduceComponentsToState: m,
                headManager: e,
                children: t
            })
        };
        ("function" == typeof i.default || "object" == typeof i.default && null !== i.default) && void 0 === i.default.__esModule && (Object.defineProperty(i.default, "__esModule", {
            value: !0
        }), Object.assign(i.default, i), e.exports = i.default)
    }, 88143, (t, e, i) => {
        function n({
            widthInt: t,
            heightInt: e,
            blurWidth: i,
            blurHeight: r,
            blurDataURL: s,
            objectFit: o
        }) {
            let a = i ? 40 * i : t,
                l = r ? 40 * r : e,
                u = a && l ? `viewBox='0 0 ${a} ${l}'` : "";
            return `%3Csvg xmlns='http://www.w3.org/2000/svg' ${u}%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='${u?"none":"contain"===o?"xMidYMid":"cover"===o?"xMidYMid slice":"none"}' style='filter: url(%23b);' href='${s}'/%3E%3C/svg%3E`
        }
        Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "getImageBlurSvg", {
            enumerable: !0,
            get: function() {
                return n
            }
        })
    }, 18556, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "ImageConfigContext", {
            enumerable: !0,
            get: function() {
                return s
            }
        });
        let n = t.r(55682)._(t.r(71645)),
            r = t.r(87690),
            s = n.default.createContext(r.imageConfigDefault)
    }, 87690, (t, e, i) => {
        Object.defineProperty(i, "__esModule", {
            value: !0
        });
        var n = {
            VALID_LOADERS: function() {
                return s
            },
            imageConfigDefault: function() {
                return u
            },
            prepareImageConfig: function() {
                return l
            }
        };
        for (var r in n) Object.defineProperty(i, r, {
            enumerable: !0,
            get: n[r]
        });
        let s = ["default", "imgix", "cloudinary", "akamai", "custom"],
            o = {},
            a = new WeakMap;

        function l(t, e) {
            let i = t ?? o,
                n = e ?? o,
                r = a.get(i);
            if (r) {
                let t = r.get(n);
                if (t) return t
            }
            let s = t || e || u,
                l = [...s.deviceSizes].sort((t, e) => t - e),
                h = [...s.imageSizes],
                d = {
                    deviceSizes: l,
                    imageSizes: h,
                    allSizes: [...l, ...h].sort((t, e) => t - e),
                    qualities: void 0 === s.qualities ? void 0 : [...s.qualities].sort((t, e) => t - e),
                    path: s.path,
                    loader: s.loader,
                    dangerouslyAllowSVG: s.dangerouslyAllowSVG,
                    unoptimized: s.unoptimized,
                    domains: s.domains,
                    remotePatterns: s.remotePatterns,
                    localPatterns: "u" < typeof window && void 0 !== e ? e.localPatterns : s.localPatterns,
                    output: s.output
                };
            return r || (r = new WeakMap, a.set(i, r)), r.set(n, d), d
        }
        let u = {
            deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
            imageSizes: [32, 48, 64, 96, 128, 256, 384],
            path: (typeof window !== "undefined" && window.STORE_BASE_PATH ? window.STORE_BASE_PATH + "_next/image" : "/_next/image"),
            loader: "default",
            loaderFile: "",
            domains: [],
            disableStaticImages: !1,
            minimumCacheTTL: 14400,
            formats: ["image/webp"],
            maximumDiskCacheSize: void 0,
            maximumRedirects: 3,
            maximumResponseBody: 5e7,
            dangerouslyAllowLocalIP: !1,
            dangerouslyAllowSVG: !1,
            contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
            contentDispositionType: "attachment",
            localPatterns: void 0,
            remotePatterns: [],
            qualities: [75],
            unoptimized: !1,
            customCacheHandler: !1
        }
    }, 98428, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "getImageProps", {
            enumerable: !0,
            get: function() {
                return l
            }
        });
        let n = t.r(90809),
            r = t.r(87690),
            s = t.r(8927),
            o = Reflect.get(n._(t.r(1948)), "default"),
            a = (0, r.prepareImageConfig)({
                deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
                imageSizes: [32, 48, 64, 96, 128, 256, 384],
                qualities: [75],
                path: (typeof window !== "undefined" && window.STORE_BASE_PATH ? window.STORE_BASE_PATH + "_next/image" : "/_next/image"),
                loader: "default",
                dangerouslyAllowSVG: !1,
                unoptimized: !1
            });

        function l(t) {
            let {
                props: e
            } = (0, s.getImgProps)(t, {
                defaultLoader: o,
                imgConf: a
            });
            for (let [t, i] of Object.entries(e)) void 0 === i && delete e[t];
            return {
                props: e
            }
        }
    }, 1948, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "default", {
            enumerable: !0,
            get: function() {
                return o
            }
        });
        let n = t.r(70965),
            r = t.r(43369);

        function s({
            config: t,
            src: e,
            width: i,
            quality: o
        }) {
            let a = (0, r.getDeploymentId)();
            if (e.startsWith("/") && !e.startsWith("//"))
                if (e.includes("/_next/static/immutable") && !(0, r.getAssetToken)()) a = void 0;
                else {
                    let t = e.indexOf("?");
                    if (-1 !== t) {
                        let i = new URLSearchParams(e.slice(t + 1)),
                            n = i.get("dpl");
                        if (n) {
                            a = n, i.delete("dpl");
                            let r = i.toString();
                            e = e.slice(0, t) + (r ? "?" + r : "")
                        }
                    }
                }
            if (e.startsWith("/") && e.includes("?") && t.localPatterns ?.length === 1 && "**" === t.localPatterns[0].pathname && "" === t.localPatterns[0].search) throw Error(`Image with src "${e}" is using a query string which is not configured in images.localPatterns.
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns`);
            let l = (0, n.findClosestQuality)(o, t);
            return `${t.path}?url=${encodeURIComponent(e)}&w=${i}&q=${l}${e.startsWith("/")&&a?`&dpl=${a}`:""}`
        }
        s.__next_img_default = !0;
        let o = s
    }, 65856, (t, e, i) => {
        t.i(47167), Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "RouterContext", {
            enumerable: !0,
            get: function() {
                return n
            }
        });
        let n = (t.r(55682)._(t.r(71645))).default.createContext(null)
    }, 98879, (t, e, i) => {
        Object.defineProperty(i, "__esModule", {
            value: !0
        }), Object.defineProperty(i, "default", {
            enumerable: !0,
            get: function() {
                return a
            }
        });
        let n = t.r(71645),
            r = "u" < typeof window,
            s = r ? () => {} : n.useLayoutEffect,
            o = r ? () => {} : n.useEffect;

        function a(t) {
            let {
                headManager: e,
                reduceComponentsToState: i
            } = t;

            function a() {
                if (e && e.mountedInstances) {
                    let t = n.Children.toArray(Array.from(e.mountedInstances).filter(Boolean));
                    e.updateHead(i(t))
                }
            }
            return r && (e ?.mountedInstances ?.add(t.children), a()), s(() => (e ?.mountedInstances ?.add(t.children), () => {
                e ?.mountedInstances ?.delete(t.children)
            })), s(() => (e && (e._pendingUpdate = a), () => {
                e && (e._pendingUpdate = a)
            })), o(() => (e && e._pendingUpdate && (e._pendingUpdate(), e._pendingUpdate = null), () => {
                e && e._pendingUpdate && (e._pendingUpdate(), e._pendingUpdate = null)
            })), null
        }
    }])
})();