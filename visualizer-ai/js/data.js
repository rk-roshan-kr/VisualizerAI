/**
 * data.js
 * Contains the curriculum and lesson content.
 * Loaded before app.js to avoid fetch/CORS issues.
 */

window.LESSON_DATA = {
    "CONT_25SPH-143_1.1.1.pdf": {
        "topic": "Lecture Topic 1.1.1: Semiconductor Basics",
        "chat_responses": {
            "why": "Semiconductors are special because we can control their conductivity. By adding impurities (doping) or changing temperature, we turn them from insulators to conductors!",
            "how": "It happens at the atomic level. Silicon atoms share electrons. When we add energy, some electrons break free and move.",
            "gap": "The Forbidden Energy Gap is the energy hurdle an electron must jump to conduct electricity. Silicon's gap is 1.1 eV.",
            "hole": "A Hole is just the absence of an electron. Think of it like a bubble in water. It moves opposite to the electron.",
            "silicon": "Silicon is used because it's abundant (sand!) and has a perfect energy gap for room temperature electronics.",
            "default": "That's a great question! Focus on the Energy Bands and how electrons jump across the gap. That's the key concept here."
        },
        "steps": [
            {
                "levels": ["baby", "starting"],
                "type": "intro",
                "text": "👋 **Welcome to Semiconductor Physics!**\n\nLet's start with the absolute basics. Materials are classified by how well they conduct electricity.\n\nImagine electricity as a flow of water (electrons).",
                "visual_html": "<h1>Material Types</h1><div style='display:flex; gap:20px; justify-content:center; margin-top:30px;'><div style='background:linear-gradient(135deg, #ef4444, #b91c1c); padding:20px; border-radius:12px; width:150px; box-shadow:0 10px 20px rgba(239,68,68,0.3);'><h3>Insulator</h3><p>🚫 No Flow</p><p style='font-size:0.8rem; opacity:0.8;'>Rubber, Wood</p></div><div style='background:linear-gradient(135deg, #eab308, #a16207); padding:20px; border-radius:12px; width:150px; box-shadow:0 10px 20px rgba(234,179,8,0.3); transform:scale(1.1); border:2px solid #fff;'><h3>Semiconductor</h3><p>⚡ Controlled Flow</p><p style='font-size:0.8rem; opacity:0.8;'>Silicon, Germanium</p></div><div style='background:linear-gradient(135deg, #22c55e, #15803d); padding:20px; border-radius:12px; width:150px; box-shadow:0 10px 20px rgba(34,197,94,0.3);'><h3>Conductor</h3><p>🌊 Free Flow</p><p style='font-size:0.8rem; opacity:0.8;'>Copper, Gold</p></div></div>",
                "options": ["Got it"]
            },
            {
                "levels": ["intermediate", "master"],
                "type": "intro",
                "text": "👋 **Semiconductor Physics Review**\n\nLet's dive straight into the band theory. The classification of materials depends on the Forbidden Energy Gap ($E_g$).",
                "visual_html": "<h1>Band Theory</h1><div style='display:flex; gap:20px; justify-content:center; margin-top:30px;'><div style='background:rgba(255,255,255,0.05); padding:20px; border-radius:12px;'><h3>Insulator</h3><p>$E_g > 5 eV$</p></div><div style='background:rgba(124, 58, 237, 0.2); border:1px solid #7c3aed; padding:20px; border-radius:12px;'><h3>Semiconductor</h3><p>$E_g \\approx 1 eV$</p></div><div style='background:rgba(255,255,255,0.05); padding:20px; border-radius:12px;'><h3>Conductor</h3><p>$E_g \\approx 0 eV$</p></div></div>",
                "options": ["Proceed"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "The magic lies in the **Energy Bands**.\n\nElectrons live in the **Valence Band**. To conduct, they must jump to the **Conduction Band**.\n\nThe gap between them is the **Forbidden Energy Gap ($E_g$)**.",
                "visual_html": "<h1>Energy Bands</h1><div style='position:relative; height:300px; width:200px; margin:0 auto; border:2px solid rgba(255,255,255,0.2); border-radius:12px; overflow:hidden; background:#000;'><div style='position:absolute; top:0; width:100%; height:80px; background:linear-gradient(180deg, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.1)); display:flex; align-items:center; justify-content:center; border-bottom:1px solid #22c55e;'>Conduction Band</div><div style='position:absolute; bottom:0; width:100%; height:80px; background:linear-gradient(0deg, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.1)); display:flex; align-items:center; justify-content:center; border-top:1px solid #3b82f6;'>Valence Band</div><div style='position:absolute; top:80px; bottom:80px; width:100%; display:flex; align-items:center; justify-content:center; flex-direction:column;'><span style='font-size:2rem; animation:bounce 2s infinite;'>↕️</span><p>Energy Gap ($E_g$)</p></div></div>",
                "options": ["Next"]
            },
            {
                "levels": ["baby", "starting"],
                "type": "question",
                "text": "For a **Semiconductor** like Silicon, this gap is small (~1.1 eV). For an **Insulator**, it is very large (> 5 eV).\n\nWhat happens if we heat up a semiconductor?",
                "visual_html": "<h1>Heat Effect</h1><p>Heat energy = Kinetic energy for electrons.</p>",
                "options": ["It conducts better", "It stops conducting", "Nothing happens"],
                "correct_option": 0,
                "success_msg": "✅ Correct! Heat gives electrons enough energy to jump the small gap.",
                "fail_msg": "❌ Think about it: Heat gives energy. Energy helps them jump the gap."
            },
            {
                "levels": ["intermediate", "master"],
                "type": "question",
                "text": "At 0K, a semiconductor behaves as an insulator. As Temperature increases, conductivity increases.\n\nThis means Semiconductors have a...",
                "visual_html": "<h1>Temperature Coefficient</h1><p>$\\rho$ vs $T$</p>",
                "options": ["Positive Temp Coefficient", "Negative Temp Coefficient"],
                "correct_option": 1,
                "success_msg": "✅ Correct! Resistance decreases as Temp increases (NTC).",
                "fail_msg": "❌ Metals have PTC (Resistance up with Temp). Semiconductors are opposite."
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "Now, let's look at **Silicon (Si)**. It has atomic number 14.\n\nIt has **4 Valence Electrons** in its outermost shell. It wants 8 to be stable.",
                "visual_html": "<h1>Silicon Atom</h1><div class='atom-display' style='position:relative; width:200px; height:200px; margin:0 auto; background:radial-gradient(circle, #222 0%, #000 70%); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 30px rgba(102, 126, 234, 0.2);'><div style='width:60px; height:60px; background:linear-gradient(135deg, #667eea, #764ba2); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; box-shadow:0 0 15px #667eea;'>Si</div><div style='position:absolute; width:12px; height:12px; background:#fbbf24; border-radius:50%; top:20px; left:50%; box-shadow:0 0 10px #fbbf24; animation:orbit1 4s linear infinite;'></div><div style='position:absolute; width:12px; height:12px; background:#fbbf24; border-radius:50%; bottom:20px; left:50%; box-shadow:0 0 10px #fbbf24; animation:orbit2 4s linear infinite;'></div><div style='position:absolute; width:12px; height:12px; background:#fbbf24; border-radius:50%; left:20px; top:50%; box-shadow:0 0 10px #fbbf24; animation:orbit3 4s linear infinite;'></div><div style='position:absolute; width:12px; height:12px; background:#fbbf24; border-radius:50%; right:20px; top:50%; box-shadow:0 0 10px #fbbf24; animation:orbit4 4s linear infinite;'></div></div><p>4 Electrons looking for friends.</p>",
                "options": ["How do they find friends?"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "They form **Covalent Bonds**! Each Si atom shares electrons with 4 neighbors.\n\nThis forms a strong crystal lattice.",
                "visual_html": "<h1>Crystal Lattice</h1><div class='matrix-display'><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div><div class='matrix-row'>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</div><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div><div class='matrix-row'>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</div><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div></div><p>At 0 Kelvin, all electrons are stuck in bonds. It's an insulator!</p>",
                "options": ["But at Room Temp?"]
            },
            {
                "levels": ["baby", "starting"],
                "type": "explain",
                "text": "At Room Temperature, some bonds break! 💥\n\nAn electron escapes (becomes free) and leaves behind a **Hole**.\n\n**Hole**: A vacancy that behaves like a positive charge.",
                "visual_html": "<h1>Electron-Hole Pair</h1><div class='matrix-display'><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div><div class='matrix-row'>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</div><div class='matrix-row'><span>Si</span>—<span style='color:#ef4444; font-weight:bold; text-shadow:0 0 10px red;'>h+</span>...<span style='color:#fbbf24; font-size:0.8em; text-shadow:0 0 10px yellow;'>e-</span>—<span>Si</span></div><div class='matrix-row'>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</div><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div></div><p>Generation: Heat creates e- and h+ pairs.</p>",
                "options": ["Summary"]
            },
            {
                "levels": ["intermediate", "master"],
                "type": "explain",
                "text": "At Room Temperature, thermal energy breaks bonds, generating **Electron-Hole Pairs (EHPs)**.\n\n$n_i$ is the intrinsic carrier concentration.\n\n$n_i^2 = A_0 T^3 e^{-E_g/kT}$",
                "visual_html": "<h1>Intrinsic Carrier Concentration</h1><div class='matrix-display'><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div><div class='matrix-row'>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</div><div class='matrix-row'><span>Si</span>—<span style='color:#ef4444; font-weight:bold; text-shadow:0 0 10px red;'>h+</span>...<span style='color:#fbbf24; font-size:0.8em; text-shadow:0 0 10px yellow;'>e-</span>—<span>Si</span></div><div class='matrix-row'>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</div><div class='matrix-row'><span>Si</span>—<span>Si</span>—<span>Si</span></div></div><p>Mass Action Law: $n \\cdot p = n_i^2$</p>",
                "options": ["Summary"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "intro",
                "text": "So, in an **Intrinsic (Pure) Semiconductor**:\n\n$n_e = n_h = n_i$\n\nNumber of Electrons = Number of Holes = Intrinsic Carrier Concentration.",
                "visual_html": "<h1>Intrinsic Semiconductor</h1><p>Pure Silicon. Not very useful yet because conductivity is low.</p><h3>Next Up: Doping (Extrinsic)</h3>",
                "options": ["Finish Lesson"]
            }
        ]
    },
    "CONT_25SPH-143_2.1.1.pdf": {
        "topic": "Lecture Topic 2.1.1: PN Junction Diode",
        "chat_responses": {
            "depletion": "The Depletion Region is the area near the junction where there are no free carriers (electrons or holes), only immobile ions.",
            "bias": "Biasing simply means applying an external voltage to the diode to control its operation.",
            "forward": "In Forward Bias, we connect Positive to P-type. This pushes carriers towards the junction and current flows.",
            "reverse": "In Reverse Bias, we connect Positive to N-type. This pulls carriers away from the junction. No current flows.",
            "barrier": "The Barrier Potential is the built-in voltage that stops diffusion. It's about 0.7V for Silicon.",
            "default": "Try asking about 'Forward Bias', 'Reverse Bias', or the 'Depletion Region'!"
        },
        "steps": [
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "intro",
                "text": "👋 **The PN Junction**\n\nThis is the heart of modern electronics. It's what happens when we join a P-type material and an N-type material.",
                "visual_html": "<h1>Two Worlds Collide</h1><div style='display:flex; justify-content:center; align-items:center; height:200px;'><div style='width:150px; height:150px; background:rgba(239, 68, 68, 0.2); border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; flex-direction:column; box-shadow:0 0 20px rgba(239,68,68,0.2);'><h3>P-Type</h3><p>Holes (h+)</p><small>Majority Carriers</small></div><div style='width:150px; height:150px; background:rgba(59, 130, 246, 0.2); border:2px solid #3b82f6; display:flex; align-items:center; justify-content:center; flex-direction:column; box-shadow:0 0 20px rgba(59,130,246,0.2);'><h3>N-Type</h3><p>Electrons (e-)</p><small>Majority Carriers</small></div></div>",
                "options": ["Join them!"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "When they touch, **Diffusion** happens.\n\nElectrons in N-type see a lack of electrons in P-type and rush over.\nHoles in P-type rush to N-type.",
                "visual_html": "<h1>Diffusion</h1><div style='display:flex; justify-content:center; align-items:center; height:200px;'><div style='width:150px; height:150px; background:rgba(239, 68, 68, 0.2); border-right:none; display:flex; align-items:center; justify-content:center;'>h+ ➡️</div><div style='width:150px; height:150px; background:rgba(59, 130, 246, 0.2); border-left:none; display:flex; align-items:center; justify-content:center;'>⬅️ e-</div></div><p>They cross the border (Junction).</p>",
                "options": ["What happens next?"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "When they cross, they recombine and disappear! 👻\n\nThis leaves behind **Immobile Ions** near the junction.\n\nN-side loses e-, becomes **Positive**.\nP-side gains e-, becomes **Negative**.",
                "visual_html": "<h1>Depletion Region</h1><div style='display:flex; justify-content:center; align-items:center; height:200px;'><div style='width:100px; height:150px; background:rgba(239, 68, 68, 0.2); display:flex; align-items:center; justify-content:center;'>P</div><div style='width:100px; height:150px; background:#333; border:1px dashed #fff; display:flex; align-items:center; justify-content:center; flex-direction:column;'><span style='color:#ef4444; font-weight:bold;'>- - -</span><span style='color:#3b82f6; font-weight:bold;'>+ + +</span><small>Depletion Layer</small></div><div style='width:100px; height:150px; background:rgba(59, 130, 246, 0.2); display:flex; align-items:center; justify-content:center;'>N</div></div><p>This region is 'depleted' of mobile carriers.</p>",
                "options": ["Why does it stop?"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "Good question. The immobile ions create an **Electric Field**.\n\nThis field pushes back! It says \"No more electrons allowed!\"\n\nThis creates a **Barrier Potential ($V_b$)**.",
                "visual_html": "<h1>Barrier Potential</h1><p>For Silicon, $V_b \\approx 0.7V$</p><p>For Germanium, $V_b \\approx 0.3V$</p><div style='height:4px; width:200px; background:linear-gradient(90deg, #ef4444, #3b82f6); margin:20px auto; box-shadow:0 0 10px #fff;'></div><p>It's like a hill electrons have to climb.</p>",
                "options": ["How do we overcome it?"]
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "question",
                "text": "To get current to flow, we need to apply voltage. This is called **Biasing**.\n\nIf we connect Positive terminal to P-type and Negative to N-type, what is it called?",
                "visual_html": "<h1>Biasing</h1><div style='display:flex; gap:10px; justify-content:center; align-items:center;'><div style='border:1px solid #fff; padding:10px;'>P</div><div>—</div><div style='border:1px solid #fff; padding:10px;'>N</div></div><div style='margin-top:10px;'>🔋 + connected to P</div>",
                "options": ["Forward Bias", "Reverse Bias"],
                "correct_option": 0,
                "success_msg": "✅ Correct! Forward Bias pushes carriers TOWARDS the junction.",
                "fail_msg": "❌ P to Positive is Forward. P to Negative is Reverse."
            },
            {
                "levels": ["baby", "starting", "intermediate", "master"],
                "type": "explain",
                "text": "**Forward Bias**: External voltage opposes the barrier. If $V > 0.7V$, the barrier collapses and current flows freely! 🌊\n\n**Reverse Bias**: External voltage aids the barrier. The depletion region gets wider. No current flows (except tiny leakage). 🚫",
                "visual_html": "<h1>Diode Operation</h1><div style='display:grid; grid-template-columns:1fr 1fr; gap:20px;'><div style='background:rgba(34, 197, 94, 0.1); padding:10px; border-radius:8px; border:1px solid #22c55e;'><h3>Forward</h3><p>Switch ON</p><p>Resistance $\\approx 0$</p></div><div style='background:rgba(239, 68, 68, 0.1); padding:10px; border-radius:8px; border:1px solid #ef4444;'><h3>Reverse</h3><p>Switch OFF</p><p>Resistance $\\approx \\infty$</p></div></div>",
                "options": ["Finish Lesson"]
            }
        ]
    }
};

// Merge Converted Data if available
if (window.CONVERTED_DATA) {
    Object.assign(window.LESSON_DATA, window.CONVERTED_DATA);
}

// Define Curriculum List
const manualCurriculum = [
    { id: "CONT_25SPH-143_1.1.1.pdf", title: "Lecture Topic 1.1.1: Semiconductor Basics" },
    { id: "CONT_25SPH-143_2.1.1.pdf", title: "Lecture Topic 2.1.1: PN Junction Diode" }
];

// Extract topics from LESSON_DATA for the sidebar
const convertedCurriculum = Object.keys(window.LESSON_DATA)
    .filter(key => !manualCurriculum.find(c => c.id === key)) // Avoid duplicates
    .map(key => ({
        id: key,
        title: window.LESSON_DATA[key].topic
    }));

window.CURRICULUM_LIST = [...manualCurriculum, ...convertedCurriculum];

// Sort curriculum by title for better UX
window.CURRICULUM_LIST.sort((a, b) => a.title.localeCompare(b.title));
