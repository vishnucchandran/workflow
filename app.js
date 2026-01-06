const projects = [
    {
        id: 1,
        title: "Branding for 'Aura'",
        client: "Aura Systems",
        deadline: "Today",
        deadlineStatus: "urgent",
        currentStage: 3, // 0: Ideation, 1: Design, 2: Revision, 3: Delivery
        stages: ["Ideation", "Design", "Revision", "Delivery"]
    },
    {
        id: 2,
        title: "Marketing Website Redesign",
        client: "Elevate Inc.",
        deadline: "2 Days left",
        deadlineStatus: "warning",
        currentStage: 1,
        stages: ["Ideation", "Design", "Dev Handoff", "Launch"]
    },
    {
        id: 3,
        title: "Social Media Kit Q1",
        client: "Niko Fashion",
        deadline: "Nov 5",
        deadlineStatus: "normal",
        currentStage: 0,
        stages: ["Brief", "Contents", "Review", "Final"]
    }
];

const feedback = [
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

const recentUploads = [
    { name: "Logo_Pack_v2.zip", size: "12 MB" },
    { name: "Hero_Image_Retouched.png", size: "4.2 MB" }
];

function renderProjects() {
    const container = document.getElementById('project-list');
    container.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

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
                <span class="deadline-tag ${project.deadlineStatus === 'warning' ? 'urgent' : project.deadlineStatus}">
                    ${project.deadlineStatus === 'urgent' ? '🏁 ' : '⏱ '}${project.deadline}
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
}

function renderFeedback() {
    const container = document.getElementById('feedback-list');
    container.innerHTML = '';

    feedback.forEach(item => {
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
}

function renderUploads() {
    const container = document.getElementById('recent-uploads');
    container.innerHTML = '';

    recentUploads.forEach(file => {
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

// Drag & Drop Interaction
function initDragDrop() {
    const dropZone = document.getElementById('drop-zone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.style.borderColor = 'var(--accent-blue)';
        dropZone.style.backgroundColor = 'rgba(0,122,255,0.05)';
    }

    function unhighlight(e) {
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.backgroundColor = 'transparent';
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        // Mock upload
        if (files.length > 0) {
            recentUploads.unshift({
                name: files[0].name,
                size: (files[0].size / 1024 / 1024).toFixed(1) + " MB"
            });
            renderUploads();
        }
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    renderFeedback();
    renderUploads();
    initDragDrop();
});
