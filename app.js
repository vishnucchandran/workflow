// --- Enhanced Data Store ---
const Store = {
    getKey: (key) => `flow_app_v2_${key}`,     // New version namespace

    get: (key, defaultVal) => {
        const data = localStorage.getItem(Store.getKey(key));
        return data ? JSON.parse(data) : defaultVal;
    },

    set: (key, value) => {
        localStorage.setItem(Store.getKey(key), JSON.stringify(value));
    },

    // Mock Auth
    login: (method, credential) => {
        let user = {
            id: 'u_' + Date.now(),
            name: 'Alex D.',
            role: 'Snr. Designer',
            avatar: 'AD',
            email: 'demo@flow.com',
            bio: 'Creative director with 5+ years of experience.',
            age: 28
        };

        if (method === 'google') {
            user.name = "Google User";
            user.email = "user@gmail.com";
        } else if (method === 'phone') {
            user.name = "Mobile User";
            user.phone = credential;
        }

        // Save session
        Store.set('user', user);
        return user;
    },

    logout: () => {
        localStorage.removeItem(Store.getKey('user'));
        window.location.reload();
    },

    getCurrentUser: () => {
        return Store.get('user', null);
    },

    updateProfile: (data) => {
        const user = Store.getCurrentUser();
        if (user) {
            const updated = { ...user, ...data };
            Store.set('user', updated);
            return updated;
        }
        return null;
    }
};

// --- App State ---
const App = {
    projects: [],
    clients: [],
    uploads: [], // define uploads here
    user: null,

    init: () => {
        // Load data
        App.projects = Store.get('projects', mockProjects());
        App.clients = Store.get('clients', []);
        App.uploads = Store.get('uploads', []); // load uploads
        App.user = Store.getCurrentUser();

        if (!App.user) {
            UI.showLogin();
        } else {
            UI.hideLogin();
            UI.renderAll();
            UI.updateProfileUI(App.user);
            // Default view to dashboard
            Router.navigate('dashboard');
        }

        Events.init();
    },

    addClient: (clientData) => {
        App.clients.push({ id: Date.now(), ...clientData });
        Store.set('clients', App.clients);
        UI.renderClients();
    },

    createProject: (data) => {
        const newProject = {
            id: Date.now(),
            title: data.title,
            client: data.client,
            deadline: data.deadline,
            deadlineStatus: data.priority,
            currentStage: 0,
            stages: ["Ideation", "Design", "Revision", "Delivery"]
        };
        App.projects.unshift(newProject);
        Store.set('projects', App.projects);
        UI.renderProjects();
    },

    // Add these methods back
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

// --- Mock Data ---
function mockProjects() {
    return [
        { id: 1, title: "Branding for 'Aura'", client: "Aura Systems", deadline: "Today", deadlineStatus: "urgent", currentStage: 3, stages: ["Ideation", "Design", "Revision", "Delivery"] },
        { id: 2, title: "Website Redesign", client: "Elevate Inc", deadline: "2 Days left", deadlineStatus: "warning", currentStage: 1, stages: ["Ideation", "Design", "Dev", "Launch"] }
    ];
}

// --- Router ---
const Router = {
    navigate: (viewId) => {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        // Show target
        const target = document.getElementById(`view-${viewId}`);
        if (target) target.style.display = 'block';

        // Activate nav
        const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (navItem) navItem.classList.add('active');

        // Render Refresh
        if (viewId === 'dashboard') UI.renderProjects();
        if (viewId === 'clients') UI.renderClients();
        if (viewId === 'profile' && App.user) UI.fillProfileForm();

        // Mobile: Close sidebar if open
        document.getElementById('sidebar').classList.remove('open');
    }
};

// --- UI Manager ---
const UI = {
    elements: {
        loginOverlay: document.getElementById('login-overlay'),
        sidebar: document.getElementById('sidebar'),
        mobileBtn: document.getElementById('mobile-menu-btn'),
        newProjectDialog: document.getElementById('new-project-modal'), // define these
        editProjectDialog: document.getElementById('edit-project-modal'), // define these
        uploadList: document.getElementById('recent-uploads') // define
    },

    showLogin: () => UI.elements.loginOverlay.style.display = 'flex',
    hideLogin: () => UI.elements.loginOverlay.style.display = 'none',

    renderAll: () => {
        UI.renderProjects();
        UI.renderClients();
        UI.renderUploads(); // render uploads
    },

    updateProfileUI: (user) => {
        const nameEl = document.getElementById('nav-name');
        const avatarEl = document.getElementById('nav-avatar');
        if (nameEl) nameEl.textContent = user.name;

        if (avatarEl) {
            avatarEl.textContent = user.avatarUrl ? '' : (user.name ? user.name.charAt(0) : 'U');
            if (user.avatarUrl) {
                avatarEl.style.backgroundImage = `url(${user.avatarUrl})`;
                avatarEl.style.backgroundSize = 'cover';
                avatarEl.style.color = 'transparent';
            } else {
                avatarEl.style.backgroundImage = 'none';
                avatarEl.style.color = 'white';
            }
        }
    },

    fillProfileForm: () => {
        const u = App.user;
        if (!u) return;
        document.getElementById('profile-name').value = u.name || '';
        document.getElementById('profile-age').value = u.age || '';
        document.getElementById('profile-role').value = u.role || '';
        document.getElementById('profile-bio').value = u.bio || '';
        document.getElementById('profile-avatar-url').value = u.avatarUrl || '';

        // Preview
        const preview = document.getElementById('profile-avatar-preview');
        if (u.avatarUrl) {
            preview.innerText = '';
            preview.style.backgroundImage = `url(${u.avatarUrl})`;
            preview.style.backgroundSize = 'cover';
        } else {
            preview.innerText = u.name ? u.name.charAt(0) : 'U';
            preview.style.backgroundImage = 'none';
        }
    },

    renderProjects: () => {
        const list = document.getElementById('project-list');
        if (!list) return;
        list.innerHTML = '';
        App.projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.id = project.id;
            card.onclick = (e) => {
                Events.openEditModal(project.id);
            };

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
            list.appendChild(card);
        });
    },

    renderClients: () => {
        const list = document.getElementById('clients-list');
        if (!list) return;
        list.innerHTML = '';
        if (App.clients.length === 0) {
            list.innerHTML = '<p style="color:#999; grid-column:1/-1; text-align:center;">No clients yet. Add one!</p>';
            return;
        }

        App.clients.forEach(c => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <h3>${c.name}</h3>
                <span class="email">${c.email || 'No email'}</span>
                <p class="notes">${c.notes || 'No notes'}</p>
            `;
            list.appendChild(card);
        });
    },

    renderUploads: () => {
        const container = UI.elements.uploadList;
        if (!container) return;
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

// --- Events ---
const Events = {
    init: () => {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                Router.navigate(view);
            });
        });

        // Mobile Menu
        const mbBtn = document.getElementById('mobile-menu-btn');
        if (mbBtn) {
            mbBtn.addEventListener('click', () => {
                document.getElementById('sidebar').classList.add('open');
            });
        }

        const sbClose = document.getElementById('sidebar-close');
        if (sbClose) {
            sbClose.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('open');
            });
        }

        // Auth
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input');
            Store.login('email', { email: inputs[0].value });
            App.init(); // Reload state
        });

        document.getElementById('login-google').addEventListener('click', () => {
            // Simulate Google Login
            setTimeout(() => {
                Store.login('google');
                App.init();
            }, 800);
        });

        // Phone Auth Flow
        const phStart = document.getElementById('login-phone-start');
        const otpForm = document.getElementById('otp-form');
        const loginForm = document.getElementById('login-form');

        phStart.addEventListener('click', () => {
            loginForm.style.display = 'none';
            document.querySelector('.auth-buttons').style.display = 'none';
            document.querySelector('.divider').style.display = 'none';
            otpForm.style.display = 'block';
        });

        document.getElementById('send-otp-btn').addEventListener('click', () => {
            const phone = document.getElementById('phone-number').value;
            if (phone.length > 5) {
                document.getElementById('otp-input-group').style.display = 'block';
                document.getElementById('send-otp-btn').style.display = 'none';
                document.getElementById('verify-otp-btn').style.display = 'block';
                alert('OTP sent to ' + phone + ' (Use 123456)');
            } else {
                alert('Please enter a valid number');
            }
        });

        document.getElementById('verify-otp-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const otp = document.getElementById('otp-code').value;
            if (otp === '123456') {
                Store.login('phone', document.getElementById('phone-number').value);
                App.init();
            } else {
                alert('Invalid OTP');
            }
        });

        document.getElementById('back-to-login').addEventListener('click', () => {
            // Reset UI manually or just reload for simplicity in demo
            window.location.reload();
        });


        // Profile Save
        document.getElementById('save-profile-btn').addEventListener('click', () => {
            const form = document.getElementById('profile-form');
            const data = {
                name: form.querySelector('[name="name"]').value,
                age: form.querySelector('[name="age"]').value,
                role: form.querySelector('[name="role"]').value,
                bio: form.querySelector('[name="bio"]').value,
                avatarUrl: form.querySelector('[name="avatarUrl"]').value
            };
            const updatedUser = Store.updateProfile(data);
            UI.updateProfileUI(updatedUser);
            UI.fillProfileForm(); // Refresh preview
            alert('Profile Saved!');
        });

        // Clients
        document.getElementById('add-client-btn').addEventListener('click', () => {
            document.getElementById('new-client-modal').showModal();
        });

        document.getElementById('new-client-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            App.addClient(Object.fromEntries(fd.entries()));
            document.getElementById('new-client-modal').close();
            e.target.reset();
        });

        // Project Modals
        const newProjBtn = document.getElementById('new-project-btn');
        if (newProjBtn) {
            newProjBtn.onclick = () => UI.elements.newProjectDialog.showModal();
        }

        document.getElementById('new-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            App.createProject(data);
            UI.elements.newProjectDialog.close();
        });

        document.getElementById('edit-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id');
            const stage = formData.get('stage');
            App.updateProjectStage(id, stage);
            UI.elements.editProjectDialog.close();
        });

        document.getElementById('delete-project-btn').addEventListener('click', () => {
            const id = document.querySelector('#edit-project-form input[name="id"]').value;
            if (confirm('Are you sure you want to delete this project?')) {
                App.deleteProject(id);
                UI.elements.editProjectDialog.close();
            }
        });

        // Clients Button override (remove old one)

        // Modal Closers
        document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = (e) => e.target.closest('dialog').close());

        // Drag & Drop
        Events.initDragDrop();
    },

    openEditModal: (id) => {
        const p = App.projects.find(x => x.id == id);
        if (!p) return;

        const form = document.getElementById('edit-project-form');
        form.querySelector('input[name="id"]').value = p.id;

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
                Store.set('uploads', App.uploads);
                UI.renderUploads();
            }
        }, 800);
    }
};

document.addEventListener('DOMContentLoaded', App.init);
