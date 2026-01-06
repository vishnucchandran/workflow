/**
 * Workflow App - Functional v1.0
 * Features: Auth, Project CRUD, LocalStorage Persistence, Drag&Drop
 */

// --- Data Store (Local Storage Mock for now) ---
const Store = {
    getKey: (key) => `flow_app_${key}`,

    get: (key, defaultVal) => {
        const data = localStorage.getItem(Store.getKey(key));
        return data ? JSON.parse(data) : defaultVal;
    },

    set: (key, value) => {
        localStorage.setItem(Store.getKey(key), JSON.stringify(value));
    },

    // Mock generic "Users"
    login: (email, password) => {
        // In a real app, this hits Firebase Auth
        if (email && password) {
            const user = {
                id: 'u_' + Date.now(),
                name: 'Alex D.',
                email: email,
                role: 'Snr. Designer',
                avatar: 'AD'
            };
            Store.set('user', user);
            return user;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem(Store.getKey('user'));
        window.location.reload();
    },

    getCurrentUser: () => {
        return Store.get('user', null);
    }
};

// --- Mock Data Seeds ---
const defaultProjects = [
    {
        id: 1729000,
        title: "Branding for 'Aura'",
        client: "Aura Systems",
        deadline: "Today",
        deadlineStatus: "urgent",
        currentStage: 3,
        stages: ["Ideation", "Design", "Revision", "Delivery"]
    },
    {
        id: 1729001,
        title: "Marketing Website Redesign",
        client: "Elevate Inc.",
        deadline: "2026-01-08",
        deadlineStatus: "warning",
        currentStage: 1,
        stages: ["Ideation", "Design", "Dev Handoff", "Launch"]
    }
];

const defaultFeedback = [
    {
        id: 1,
        author: "Sarah L.",
        avatarColor: "#FF9A9E",
        project: "Branding for 'Aura'",
        time: "1h ago",
        message: "Love the initial concepts! Can we explore a warmer color palette for option 2?",
        type: "approval"
    },
    {
        id: 2,
        author: "Mike R.",
        avatarColor: "#a18cd1",
        project: "Website Redesign",
        time: "3h ago",
        message: "Header looks great. The font size on mobile needs a tweak.",
        type: "comment"
    },
    {
        id: 3,
        author: "Elena G.",
        avatarColor: "#84fab0",
        project: "Social Media Kit",
        time: "5h ago",
        message: "Please include the raw files in the next drop.",
        type: "request"
    }
];

// --- App State ---
const App = {
    projects: [],
    feedback: [],
    uploads: [],
    user: null,

    init: () => {
        // Load Data
        App.projects = Store.get('projects', defaultProjects);
        App.feedback = Store.get('feedback', defaultFeedback);
        App.uploads = Store.get('uploads', []);
        App.user = Store.getCurrentUser();

        // Check Auth
        if (!App.user) {
            UI.showLogin();
        } else {
            UI.hideLogin();
            UI.renderAll();
        }

        // Listeners
        Events.init();
    },

    createProject: (data) => {
        const newProject = {
            id: Date.now(),
            title: data.title,
            client: data.client,
            deadline: data.deadline,
            deadlineStatus: data.priority,
            currentStage: 0,
            stages: ["Ideation", "Design", "Revision", "Delivery"] // Default workflow
        };
        App.projects.unshift(newProject);
        Store.set('projects', App.projects);
        UI.renderProjects();
        return newProject;
    },

    updateProjectStage: (id, stageIndex) => {
        const p = App.projects.find(p => p.id == id);
        if (p) {
            p.currentStage = parseInt(stageIndex);
            Store.set('projects', App.projects);
            UI.renderProjects();
        }
    },

    deleteProject: (id) => {
        App.projects = App.projects.filter(p => p.id != id);
        Store.set('projects', App.projects);
        UI.renderProjects();
    }
};

// --- UI Manager ---
const UI = {
    elements: {
        projectList: document.getElementById('project-list'),
        feedbackList: document.getElementById('feedback-list'),
        uploadList: document.getElementById('recent-uploads'),
        loginOverlay: document.getElementById('login-overlay'),
        newProjectDialog: document.getElementById('new-project-modal'),
        editProjectDialog: document.getElementById('edit-project-modal')
    },

    showLogin: () => {
        UI.elements.loginOverlay.style.display = 'flex';
    },

    hideLogin: () => {
        UI.elements.loginOverlay.style.display = 'none';
    },

    renderAll: () => {
        UI.renderProjects();
        UI.renderFeedback();
        UI.renderUploads();
    },

    renderProjects: () => {
        const container = UI.elements.projectList;
        container.innerHTML = ' '; // Clear

        App.projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.id = project.id;
            card.onclick = (e) => {
                // Prevent opening when clicking specific controls if we added them?
                // For now, entire card opens edit modal
                Events.openEditModal(project.id);
            };

            // Calculate Visual Deadline
            let dateDisplay = project.deadline;
            // Simple date calc
            if (project.deadline !== "Today" && !project.deadline.includes("Days left")) {
                const diff = new Date(project.deadline) - new Date();
                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                if (daysLeft < 0) dateDisplay = "Overdue";
                else if (daysLeft === 0) dateDisplay = "Today";
                else if (daysLeft <= 7) dateDisplay = daysLeft + " Days left";
            }

            // Generate timeline HTML
            const timelineHTML = project.stages.map((stageName, index) => {
                let statusClass = '';
                if (index < project.currentStage) statusClass = 'completed';
                else if (index === project.currentStage) statusClass = 'active';
                const checkIcon = '✓';

                return `
                    <div class="stage ${statusClass}">
                        <div class="stage-dot">
                            ${index < project.currentStage ? checkIcon : (index + 1)}
                        </div>
                        <span class="stage-label">${stageName}</span>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="card-top">
                    <div class="project-title">
                        <h3>${project.title}</h3>
                        <span class="client-name">${project.client}</span>
                    </div>
                    <span class="deadline-tag ${project.deadlineStatus}">
                        ${project.deadlineStatus === 'urgent' ? '🏁 ' : '⏱ '}${dateDisplay}
                    </span>
                </div>
                <div class="timeline">
                    <div class="timeline-track">
                        ${timelineHTML}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    renderFeedback: () => {
        const container = UI.elements.feedbackList;
        container.innerHTML = '';
        App.feedback.forEach(item => {
            const div = document.createElement('div');
            div.className = 'feedback-item';
            div.innerHTML = `
                <div class="avatar" style="background: ${item.avatarColor}; color: #fff;">${item.author.charAt(0)}</div>
                <div class="feedback-content">
                    <div class="feedback-header">
                        <span class="author">${item.author}</span>
                        <span class="time">${item.time}</span>
                    </div>
                    <div class="project-ref">${item.project}</div>
                    <p class="message">${item.message}</p>
                    <div class="feedback-actions">
                        <button class="btn-xs btn-reply">Reply</button>
                        ${item.type === 'approval' ? '<button class="btn-xs btn-approve">Approve</button>' : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    },

    renderUploads: () => {
        const container = UI.elements.uploadList;
        container.innerHTML = '';
        App.uploads.forEach(file => {
            const li = document.createElement('li');
            li.className = 'upload-item';
            li.innerHTML = `
                <div class="file-icon">📄</div>
                <span>${file.name}</span>
                <span style="color: var(--text-secondary); margin-left: auto;">${file.size}</span>
            `;
            container.appendChild(li);
        });
    }
};

// --- Events Manager ---
const Events = {
    init: () => {
        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input');
            const user = Store.login(inputs[0].value, inputs[1].value);
            if (user) App.init();
        });

        // Add Project Modal Controls
        const newProjBtn = document.querySelector('.btn-primary'); // "+ New Project"
        if (newProjBtn && newProjBtn.innerText.includes('New Project')) {
            newProjBtn.onclick = () => UI.elements.newProjectDialog.showModal();
        }

        // Close Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('dialog').close();
            });
        });

        // Create Project Submit
        document.getElementById('new-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            App.createProject(data);
            UI.elements.newProjectDialog.close();
        });

        // Edit Project Submit
        document.getElementById('edit-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id');
            const stage = formData.get('stage');
            App.updateProjectStage(id, stage);
            UI.elements.editProjectDialog.close();
        });

        // Delete Project
        document.getElementById('delete-project-btn').addEventListener('click', () => {
            const id = document.querySelector('#edit-project-form input[name="id"]').value;
            if (confirm('Are you sure you want to delete this project?')) {
                App.deleteProject(id);
                UI.elements.editProjectDialog.close();
            }
        });

        // Drag & Drop
        Events.initDragDrop();
    },

    openEditModal: (id) => {
        const p = App.projects.find(x => x.id == id);
        if (!p) return;

        const form = document.getElementById('edit-project-form');
        form.querySelector('input[name="id"]').value = p.id;

        // Select logic
        const radios = form.querySelectorAll('input[name="stage"]');
        radios.forEach(r => {
            if (r.value == p.currentStage) r.checked = true;
        });

        UI.elements.editProjectDialog.showModal();
    },

    initDragDrop: () => {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        if (!dropZone || !fileInput) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault(); e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(name => {
            dropZone.addEventListener(name, () => dropZone.style.borderColor = 'var(--accent-blue)', false);
        });

        ['dragleave', 'drop'].forEach(name => {
            dropZone.addEventListener(name, () => dropZone.style.borderColor = 'var(--border-color)', false);
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) Events.handleUpload(files[0]);
        });

        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) Events.handleUpload(e.target.files[0]);
        });
    },

    handleUpload: (file) => {
        // Mock Upload
        const mockFile = {
            name: file.name,
            size: "Uploading..."
        };
        App.uploads.unshift(mockFile);
        UI.renderUploads();

        setTimeout(() => {
            const item = App.uploads.find(u => u.name === file.name);
            if (item) {
                item.size = (file.size / 1024 / 1024).toFixed(1) + " MB";
                Store.set('uploads', App.uploads); // Persist
                UI.renderUploads();
            }
        }, 800);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', App.init);
