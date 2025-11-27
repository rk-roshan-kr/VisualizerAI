/**
 * Visualizer AI - App Logic
 * Powered by Google Gemini 2.5 Pro
 */

const App = {
    apiKey: "AIzaSyCD9FJdKV789CoJzehHAjDOpBpLbc2JevU",
    lessons: {},
    currentLesson: null,
    currentStep: 0,
    isWaiting: false,
    isGenerating: false,
    generationRetries: 0,

    ui: {
        chapterList: document.getElementById('chapter-list'),
        stage: document.getElementById('visual-stage'),
        topicTitle: document.getElementById('current-topic'),
        chatFeed: document.getElementById('chat-feed'),
        input: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        progressBar: document.getElementById('lesson-progress')
    },

    init: async () => {
        // Initialize Firebase
        if (window.initFirebase) {
            window.initFirebase();
        }

        if (window.LESSON_DATA) {
            App.lessons = window.LESSON_DATA;
        }
        App.renderCurriculum();

        App.ui.sendBtn.addEventListener('click', App.handleInput);
        App.ui.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') App.handleInput();
        });

        console.log("Visualizer AI Initialized");
    },

    resetState: () => {
        App.currentLesson = null;
        App.currentStep = 0;
        App.isWaiting = false;
        App.isGenerating = false;
        App.generationRetries = 0;
        App.ui.chatFeed.innerHTML = ''; // Clear chat
        App.addMessage('ai', "Hello! I'm your AI tutor. Pick a topic to start!");
    },

    renderCurriculum: () => {
        const chapters = window.CURRICULUM_LIST || [];
        App.ui.chapterList.innerHTML = '';
        chapters.forEach(chap => {
            const el = document.createElement('div');
            el.className = 'chapter-item';
            el.textContent = chap.title;
            el.onclick = () => App.startLesson(chap.id, chap.title);
            App.ui.chapterList.appendChild(el);
        });
    },

    startLesson: (id, title) => {
        App.resetState();
        App.ui.topicTitle.textContent = title;

        // Show Level Selection Screen
        App.ui.stage.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1>Choose Your Level</h1>
                <p>Select your current understanding of <strong>${title}</strong></p>
                <div class="skill-levels" style="display: flex; flex-direction: column; gap: 15px; margin-top: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <button class="skill-btn" data-level="baby">
                        <strong>🍼 Baby</strong>
                        <span>I don't have the basic knowledge required for this topic</span>
                    </button>
                    <button class="skill-btn" data-level="starting">
                        <strong>🌱 Starting Out</strong>
                        <span>I have the basics clear, now starting this new topic</span>
                    </button>
                    <button class="skill-btn" data-level="intermediate">
                        <strong>📚 Intermediate</strong>
                        <span>I've studied before but forgotten, can solve some questions</span>
                    </button>
                    <button class="skill-btn" data-level="master">
                        <strong>🏆 Master</strong>
                        <span>I can solve questions, here for quick revision</span>
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners to the new buttons
        document.querySelectorAll('.skill-btn').forEach(btn => {
            btn.onclick = () => App.loadLessonContent(id, title, btn.dataset.level);
        });
    },

    loadLessonContent: async (id, title, level) => {
        const levelNames = {
            baby: "Baby 🍼",
            starting: "Starting Out 🌱",
            intermediate: "Intermediate 📚",
            master: "Master 🏆"
        };
        App.addMessage('user', `I'm at the ${levelNames[level]} level.`);

        // 1. Check for DEEP MODE data (High Priority)
        if (window.DEEP_JOURNEYS && window.DEEP_JOURNEYS[id]) {
            console.log("Found Deep Mode content!");
            const deepLesson = window.DEEP_JOURNEYS[id];

            // Flatten pages into a single steps array for the App
            const steps = [];
            deepLesson.pages.forEach(page => {
                if (page.nodes) {
                    page.nodes.forEach(node => {
                        steps.push({
                            type: 'deep_node',
                            data: node
                        });
                    });
                }
            });

            App.currentLesson = {
                id: deepLesson.id,
                topic: deepLesson.topic,
                steps: steps,
                skillLevel: level
            };

            App.currentStep = 0;
            App.processStep();
            return;
        }

        // 2. CHECK LOCAL DATA
        if (App.lessons[id] && App.lessons[id].steps && App.lessons[id].steps.length > 0) {
            App.ui.stage.innerHTML = `<div class="empty-state"><h1>Loading Lesson...</h1><p>Loading offline content for ${title}...</p></div>`;

            setTimeout(() => {
                const fullLesson = JSON.parse(JSON.stringify(App.lessons[id]));
                // Filter steps if they have specific levels
                if (fullLesson.steps[0].levels) {
                    fullLesson.steps = fullLesson.steps.filter(s => s.levels.includes(level));
                }
                App.currentLesson = fullLesson;
                App.currentLesson.skillLevel = level;
                App.currentStep = 0;
                App.processStep();
            }, 500);
            return;
        }

        // 3. CHECK FIREBASE
        if (window.getDb) {
            const db = window.getDb();
            if (db) {
                App.ui.stage.innerHTML = `<div class="empty-state"><h1>Checking Database...</h1><p>Looking for ${title} in the cloud...</p></div>`;
                try {
                    const doc = await db.collection('lessons').doc(id).get();
                    if (doc.exists) {
                        const fullLesson = doc.data();
                        App.lessons[id] = fullLesson; // Cache it

                        const lessonToUse = JSON.parse(JSON.stringify(fullLesson));
                        if (lessonToUse.steps && lessonToUse.steps.length > 0) {
                            if (lessonToUse.steps[0].levels) {
                                lessonToUse.steps = lessonToUse.steps.filter(s => s.levels.includes(level));
                            }
                            App.currentLesson = lessonToUse;
                            App.currentLesson.skillLevel = level;
                            App.currentStep = 0;
                            App.processStep();
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Firestore fetch error:", e);
                }
            }
        }

        // 4. GENERATE VIA API
        App.ui.stage.innerHTML = `<div class="empty-state"><h1>Generating Lesson...</h1><p>Crafting a personalized journey for ${levelNames[level]} level...</p></div>`;
        const generatedLesson = await App.generateLessonPlan(title, level);
        if (generatedLesson) {
            App.lessons[id] = generatedLesson;
            App.currentLesson = generatedLesson;
            App.currentLesson.skillLevel = level;
            App.currentStep = 0;
            App.processStep();
        } else {
            App.addMessage('ai', "Sorry, I couldn't generate the lesson right now. Please try again.");
            App.ui.stage.innerHTML = `<div class="empty-state"><h1>Error</h1><p>Failed to generate content.</p></div>`;
        }
    },

    processStep: () => {
        if (!App.currentLesson) return;

        const step = App.currentLesson.steps[App.currentStep];
        const total = App.currentLesson.steps.length;
        App.updateProgress(((App.currentStep + 1) / total) * 100);

        if (!step) {
            // End of lesson or generation needed
            if (App.isGenerating && App.generationRetries < 15) {
                if (App.generationRetries === 0) App.showBackgroundLoading();

                App.ui.stage.innerHTML = `
                    <div class="empty-state">
                        <h1>Generating More Content...</h1>
                        <p>Creating additional lessons tailored to your level</p>
                        <div class="spinner" style="margin: 20px auto; width: 40px; height: 40px; border-width: 4px;"></div>
                    </div>`;
                App.addMessage('ai', "Hold on! I'm generating more content for you...");
                App.generationRetries++;
                setTimeout(() => App.processStep(), 2000);
                return;
            }

            App.isGenerating = false;
            App.generationRetries = 0;
            App.hideBackgroundLoading();

            App.ui.stage.innerHTML = `
                <div class="empty-state">
                    <h1>Module Complete</h1>
                    <p>You've completed this comprehensive study journey!</p>
                    <div class="chat-options" style="justify-content: center; margin-top: 20px;">
                        <button onclick="App.resetState(); App.renderCurriculum();">Choose Another Topic</button>
                    </div>
                </div>`;
            App.addMessage('ai', "Great job! You've finished this lesson.");
            App.updateProgress(100);
            return;
        }

        // Handle Deep Mode Nodes
        if (step.type === 'deep_node') {
            App.renderDeepNode(step.data);
            return;
        }

        // Render Step
        if (step.options && step.options.length > 0 && (step.type === 'question' || step.type === 'quiz')) {
            App.showQuizInVisual(step);
            App.isWaiting = true;
        } else if (step.visual_html && step.visual_html.trim().length > 0) {
            App.ui.stage.innerHTML = step.visual_html;
            App.renderMath();
            App.addMessage('ai', step.text);
            App.addNextButton();
        } else {
            // Default visual
            App.ui.stage.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center;">
                    <div style="max-width: 600px;">
                        <h2 style="color: #667eea; margin-bottom: 20px; font-size: 1.8rem;">${step.text}</h2>
                    </div>
                </div>`;
            App.renderMath();
            App.addMessage('ai', step.text);
            App.addNextButton();
        }
    },

    renderDeepNode: (node) => {
        // 1. Chat Message (Core Explanation)
        App.addMessage('ai', `**${node.title || 'Concept'}**\n\n${node.concept_summary || node.core_explanation || 'No explanation available.'}`);

        // 2. Visual Stage (Interactive Explorer Layout)
        const visualStage = document.getElementById('visual-stage');

        let content = `
            <div class="deep-node-container">
                <!-- Hero Section -->
                <div class="deep-hero">
                    <h2>${node.title}</h2>
                    <p>${node.concept_summary || node.core_explanation}</p>
                </div>

                <!-- Interactive Explorer Tabs -->
                <div class="explorer-container">
                    <div class="explorer-tabs">
                        <button class="tab-btn active" onclick="App.switchTab(this, 'analogy')">💡 Analogy</button>
                        <button class="tab-btn" onclick="App.switchTab(this, 'example')">🌍 Real World</button>
                        <button class="tab-btn" onclick="App.switchTab(this, 'why')">❓ Why it Matters</button>
                    </div>
                    
                    <div class="tab-content-area">
                        <div id="analogy" class="tab-pane active">
                            <div class="analogy-box">
                                <p>${node.analogy || 'No analogy provided.'}</p>
                            </div>
                        </div>
                        <div id="example" class="tab-pane">
                            <div class="card" style="background: rgba(33, 150, 243, 0.1); border-left: 4px solid #2196F3; padding: 20px; border-radius: 12px;">
                                <p>${node.example || 'No example provided.'}</p>
                            </div>
                        </div>
                        <div id="why" class="tab-pane">
                            <div class="card" style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107; padding: 20px; border-radius: 12px;">
                                <p>${node.why_it_matters || 'Important concept.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
        `;

        if (node.interactive_element) {
            content += `
                <!-- Gamified Checkpoint -->
                <div class="gamified-checkpoint">
                    <div class="checkpoint-content">
                        <h3 style="color: #a5b4fc; margin-bottom: 15px;">🚀 Knowledge Checkpoint</h3>
                        <p style="font-size: 1.1rem; margin-bottom: 20px;">${node.interactive_element.prompt}</p>
                        
                        <div id="checkpoint-feedback" style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; display: none; animation: fadeIn 0.3s ease;">
                            <strong style="color: #4ade80;">Answer:</strong> 
                            <span style="color: #e0e7ff;">${node.interactive_element.expected_answer}</span>
                        </div>

                        <button class="reveal-btn" onclick="document.getElementById('checkpoint-feedback').style.display='block'; this.style.display='none';">
                            Reveal Answer ✨
                        </button>
                    </div>
                </div>
            `;
        }

        content += `</div>`;
        visualStage.innerHTML = content;

        App.addNextButton();
    },

    switchTab: (btn, tabId) => {
        // Remove active class from all buttons and panes
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        // Add active class to clicked button and target pane
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    },



    addNextButton: () => {
        const div = document.createElement('div');
        div.className = 'chat-options';
        const btn = document.createElement('button');
        btn.textContent = "Next ▶";
        btn.onclick = () => {
            div.remove();
            App.currentStep++;
            App.processStep();
        };
        div.appendChild(btn);
        App.ui.chatFeed.appendChild(div);
        App.ui.chatFeed.scrollTop = App.ui.chatFeed.scrollHeight;
    },

    renderMath: () => {
        if (window.renderMathInElement) {
            renderMathInElement(App.ui.stage, {
                delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }]
            });
        }
    },

    showQuizInVisual: (step) => {
        if (!step.attempts) step.attempts = 0;

        const quizHTML = `
            <div class="quiz-container" style="padding: 40px; text-align: center;">
                <h1 style="margin-bottom: 30px;">${step.text}</h1>
                <div class="quiz-options" style="display: flex; flex-direction: column; gap: 15px; max-width: 600px; margin: 0 auto;">
                    ${step.options.map((opt, idx) => `
                        <button class="quiz-option" data-answer="${opt}" style="display: flex; align-items: center; gap: 15px; padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border: 2px solid rgba(102, 126, 234, 0.3); border-radius: 12px; cursor: pointer; transition: all 0.3s; text-align: left; color: #ffffff;">
                            <span class="option-letter" style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; color: #ffffff;">${String.fromCharCode(65 + idx)}</span>
                            <span class="option-text" style="flex: 1; font-size: 1.1rem; color: #ffffff;">${opt}</span>
                        </button>
                    `).join('')}
                </div>
                ${step.attempts >= 2 && step.hint ? `
                    <div class="hint-box" style="margin-top: 30px; padding: 20px; background: rgba(255, 193, 7, 0.1); border: 2px solid rgba(255, 193, 7, 0.3); border-radius: 12px;">
                        <strong>💡 Hint:</strong> ${step.hint}
                    </div>
                ` : ''}
            </div>
        `;

        App.ui.stage.innerHTML = quizHTML;
        App.renderMath();

        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.onclick = () => {
                const answer = btn.dataset.answer;
                App.checkQuizAnswer(answer, step);
            };
            // Add hover effects via JS if needed, or rely on CSS
            btn.onmouseenter = () => {
                btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                btn.style.transform = 'translateY(-3px) scale(1.02)';
            };
            btn.onmouseleave = () => {
                btn.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))';
                btn.style.transform = 'none';
            };
        });

        App.addMessage('ai', step.text);
    },

    checkQuizAnswer: (answer, step) => {
        let isCorrect = false;

        if (step.correct_option !== undefined && step.options) {
            const correctText = step.options[step.correct_option];
            isCorrect = answer === correctText;
        } else if (step.expected_answer) {
            isCorrect = step.expected_answer.some(a => answer.toLowerCase().includes(a.toLowerCase()));
        }

        step.attempts++;

        if (isCorrect) {
            App.flashFeedback(true);
            App.addMessage('user', answer);
            App.addMessage('ai', step.success_msg || "✅ Correct! Well done!");
            setTimeout(() => {
                App.currentStep++;
                App.processStep();
            }, 1000);
        } else {
            App.flashFeedback(false);
            App.addMessage('user', answer);
            const hint = step.hint || "Review the previous explanation.";
            App.addMessage('ai', (step.fail_msg || "❌ Not quite.") + " 💡 **Hint:** " + hint);
            step.hint = hint;
            App.showQuizInVisual(step);
        }
    },

    flashFeedback: (isCorrect) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: ${isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
            z-index: 9999; pointer-events: none; animation: flashFade 500ms ease-out;
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 500);
    },

    generateLessonPlan: async (topic, skillLevel) => {
        // Fallback generation logic
        const levelInstructions = {
            baby: "Explain from basics with simple examples",
            starting: "Build understanding step by step",
            intermediate: "Quick review then practice",
            master: "Concise key points"
        };
        const initialCount = 5;
        const prompt = `Create a lesson about "${topic}" (Subject: Semiconductor Physics) for ${skillLevel} level. ${levelInstructions[skillLevel]}. Make ${initialCount} steps. Return JSON: {"topic":"${topic}","steps":[{"type":"intro","text":"content","visual_html":"html"}]}`;
        return await App.callGeminiJSON(prompt);
    },

    callGeminiJSON: async (prompt) => {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${App.apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            if (data.error || !data.candidates || !data.candidates[0]) return null;

            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (e) {
            console.error("API Error", e);
            return null;
        }
    },

    addMessage: (sender, text) => {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        let content = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        div.innerHTML = `<div class="bubble">${content}</div>`;
        App.ui.chatFeed.appendChild(div);
        if (window.renderMathInElement) {
            renderMathInElement(div, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }] });
        }
        App.ui.chatFeed.scrollTop = App.ui.chatFeed.scrollHeight;
    },

    updateProgress: (pct) => {
        App.ui.progressBar.style.width = `${pct}%`;
    },

    showBackgroundLoading: () => { /* ... implementation ... */ },
    hideBackgroundLoading: () => { /* ... implementation ... */ },

    handleInput: async () => {
        const text = App.ui.input.value.trim();
        if (!text) return;
        App.addMessage('user', text);
        App.ui.input.value = '';

        if (App.currentLesson && App.currentLesson.chat_responses) {
            const lowerText = text.toLowerCase();
            let response = App.currentLesson.chat_responses.default;
            for (const [key, value] of Object.entries(App.currentLesson.chat_responses)) {
                if (key !== 'default' && lowerText.includes(key)) {
                    response = value;
                    break;
                }
            }
            setTimeout(() => App.addMessage('ai', response), 600);
        } else {
            App.addMessage('ai', "I'm in offline mode. Please ask about specific keywords.");
        }
    },

    uploadToFirestore: async () => {
        if (!window.getDb || !window.CONVERTED_DATA) {
            console.error("❌ Database or Converted Data not available.");
            return;
        }

        const db = window.getDb();
        const batch = db.batch();
        let count = 0;

        console.log("🚀 Starting upload to Firestore...");

        for (const [id, lesson] of Object.entries(window.CONVERTED_DATA)) {
            const docRef = db.collection('lessons').doc(id);
            batch.set(docRef, lesson);
            count++;
        }

        try {
            await batch.commit();
            console.log(`✅ Successfully uploaded ${count} lessons to Firestore!`);
            App.addMessage('ai', `✅ Admin: Successfully uploaded ${count} lessons to the cloud database.`);
        } catch (e) {
            console.error("❌ Error uploading to Firestore:", e);
            App.addMessage('ai', `❌ Admin: Upload failed. Check console for details.`);
        }
    }
};

document.addEventListener('DOMContentLoaded', App.init);
window.App = App;
