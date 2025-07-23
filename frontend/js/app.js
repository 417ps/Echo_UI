// API configuration
const API_BASE_URL = 'http://localhost:8000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Page navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
    }
    
    // Show/hide navigation based on auth status
    const navbar = document.querySelector('.navbar');
    if (pageName === 'login' || pageName === 'register') {
        navbar.style.display = 'none';
    } else {
        navbar.style.display = 'block';
    }
}

// Authentication functions
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Test credentials for demo
    if (email === 'demo@altus.com' && password === 'demo123') {
        authToken = 'demo-token';
        currentUser = {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@altus.com'
        };
        localStorage.setItem('authToken', authToken);
        showPage('dashboard');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showPage('dashboard');
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Use demo@altus.com / demo123 for testing.');
    }
}

async function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const company = document.getElementById('company').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, company })
        });
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            showPage('login');
        } else {
            alert('Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration.');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showPage('login');
}

// Document upload function
async function uploadDocument(event) {
    event.preventDefault();
    
    const docType = document.getElementById('doc-type').value;
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    
    try {
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            displayAnalysisResults(result);
        } else {
            alert('Document upload failed.');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('An error occurred during document upload.');
    }
}

function displayAnalysisResults(results) {
    const resultsDiv = document.getElementById('analysis-results');
    resultsDiv.innerHTML = `
        <h3>Analysis Results</h3>
        <div class="result-item">
            <h4>Document Type: ${results.type}</h4>
            <p><strong>Summary:</strong> ${results.summary || 'Analysis in progress...'}</p>
            <p><strong>Key Points:</strong></p>
            <ul>
                ${(results.keyPoints || []).map(point => `<li>${point}</li>`).join('')}
            </ul>
            <p><strong>Compliance Status:</strong> ${results.complianceStatus || 'Pending review'}</p>
        </div>
    `;
}

// Simulated API call function (replace with actual API calls)
async function makeAPICall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`API call failed: ${response.status}`);
        }
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Chat functionality with n8n webhook
// Option 1: Direct webhook (may have CORS issues)
const N8N_WEBHOOK_URL = 'https://n8n.automation.doctor/webhook/echo';

// Option 2: Local proxy (run proxy-server.py first)
// const N8N_WEBHOOK_URL = 'http://localhost:8080/webhook';

async function sendMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send message using the new function
    sendMessageToWebhook(message);
}

// Store conversation history
let conversationHistory = [];

function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.id = `message-${Date.now()}`;
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Store in conversation history
    conversationHistory.push({
        role: sender === 'user' ? 'user' : 'assistant',
        content: message,
        timestamp: new Date().toISOString()
    });
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-wrapper';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (sender === 'assistant') {
        // Convert markdown-like formatting to HTML
        let formattedMessage = message
            // Convert headers (must be before line break conversion)
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Convert line breaks to <br> tags
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Convert **bold** to <strong>
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Convert *italic* to <em> (avoiding list markers)
            .replace(/([^-•\s])\*([^*]+)\*/g, '$1<em>$2</em>')
            // Convert numbered lists
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
            // Convert bullet lists
            .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
            // Wrap consecutive <li> tags in <ul>
            .replace(/(<li>.*<\/li>\s*)+/g, function(match) {
                return '<ul>' + match + '</ul>';
            })
            // Convert code blocks
            .replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>')
            // Convert inline code
            .replace(/`(.+?)`/g, '<code>$1</code>');
        
        // Wrap in paragraphs if not already wrapped
        if (!formattedMessage.startsWith('<')) {
            formattedMessage = '<p>' + formattedMessage + '</p>';
        }
        
        contentDiv.innerHTML = formattedMessage;
        
        // Add copy buttons to code blocks
        const codeBlocks = contentDiv.querySelectorAll('pre code');
        codeBlocks.forEach((block, index) => {
            const pre = block.parentElement;
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.onclick = () => copyCode(block.textContent, copyBtn);
            pre.style.position = 'relative';
            pre.appendChild(copyBtn);
        });
    } else {
        // User messages remain plain text
        contentDiv.textContent = message;
    }
    
    contentWrapper.appendChild(contentDiv);
    
    // Add timestamp
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = timestamp;
    contentWrapper.appendChild(timestampDiv);
    
    // Add action buttons for assistant messages
    if (sender === 'assistant') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.onclick = () => copyMessage(message, copyBtn);
        
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'action-btn';
        regenerateBtn.innerHTML = '🔄 Regenerate';
        regenerateBtn.onclick = () => regenerateLastResponse();
        
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(regenerateBtn);
        contentWrapper.appendChild(actionsDiv);
    }
    
    messageDiv.appendChild(contentWrapper);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function copyCode(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

function copyMessage(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = '✅ Copied';
        setTimeout(() => {
            button.textContent = '📋 Copy';
        }, 2000);
    });
}

function regenerateLastResponse() {
    // Find the last user message
    const lastUserMessage = conversationHistory.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
        // Remove the last assistant message from display
        const messages = document.querySelectorAll('.chat-message.assistant');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
            conversationHistory.pop(); // Remove from history
        }
        
        // Resend the message
        showTypingIndicator();
        sendMessageToWebhook(lastUserMessage.content);
    }
}

async function sendMessageToWebhook(message) {
    try {
        // Include conversation context (last 5 messages)
        const context = conversationHistory.slice(-5).map(m => ({
            role: m.role,
            content: m.content
        }));
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                userId: currentUser?.id || 'anonymous',
                timestamp: new Date().toISOString(),
                context: 'construction-assistant',
                conversationHistory: context
            })
        });
        
        if (response.ok) {
            hideTypingIndicator();
            
            // Try to parse JSON response
            let assistantMessage = 'Message received by webhook (no response body).';
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        assistantMessage = data.response || data.message || assistantMessage;
                    }
                } else {
                    // Handle non-JSON responses
                    const text = await response.text();
                    if (text) {
                        assistantMessage = text;
                    }
                }
            } catch (parseError) {
                console.warn('Could not parse webhook response:', parseError);
            }
            
            addMessageToChat(assistantMessage, 'assistant');
        } else {
            hideTypingIndicator();
            addMessageToChat(`Webhook returned status: ${response.status}. Please check your n8n workflow.`, 'assistant');
        }
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessageToChat('Sorry, I couldn\'t connect to the assistant. Please check your connection.', 'assistant');
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Particle system for login page
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationId;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: `hsl(${200 + Math.random() * 60}, 70%, 70%)`
        };
    }
    
    function initParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
    }
    
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        });
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.save();
                    ctx.globalAlpha = (1 - distance / 100) * 0.1;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        });
    }
    
    function animate() {
        updateParticles();
        drawParticles();
        animationId = requestAnimationFrame(animate);
    }
    
    function startParticles() {
        if (document.getElementById('login-page').classList.contains('active') || 
            document.getElementById('register-page').classList.contains('active')) {
            canvas.style.display = 'block';
            resizeCanvas();
            initParticles();
            animate();
        } else {
            canvas.style.display = 'none';
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    }
    
    window.addEventListener('resize', resizeCanvas);
    
    // Watch for page changes
    const observer = new MutationObserver(() => {
        startParticles();
    });
    
    observer.observe(document.getElementById('main-content'), {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
    });
    
    startParticles();
}

// Magnetic cursor functionality
function initMagneticCursor() {
    const cursor = document.querySelector('.magnetic-cursor');
    const magneticElements = document.querySelectorAll('.btn, .dashboard-card, .nav-menu a, .form-group input, .form-group select');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    // Update mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth cursor animation
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Magnetic effect for elements
    magneticElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
        
        element.addEventListener('mousedown', () => {
            cursor.classList.add('clicking');
        });
        
        element.addEventListener('mouseup', () => {
            cursor.classList.remove('clicking');
        });
    });
    
    // Add magnetic pull effect
    document.addEventListener('mousemove', (e) => {
        magneticElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            const magneticRange = 100;
            const magneticStrength = 0.1;
            
            if (distance < magneticRange && element.classList.contains('dashboard-card')) {
                const force = (magneticRange - distance) / magneticRange;
                const moveX = deltaX * force * magneticStrength;
                const moveY = deltaY * force * magneticStrength;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px) translateY(-5px)`;
            } else if (!element.matches(':hover') && element.classList.contains('dashboard-card')) {
                element.style.transform = '';
            }
        });
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    initParticleSystem();
    
    // Initialize magnetic cursor
    initMagneticCursor();
    
    // Check if user is already logged in
    if (authToken) {
        // For demo token, skip verification
        if (authToken === 'demo-token') {
            currentUser = {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@altus.com'
            };
            showPage('dashboard');
        } else {
            // Verify token is still valid
            makeAPICall('/auth/verify')
                .then(user => {
                    currentUser = user;
                    showPage('dashboard');
                })
                .catch(() => {
                    logout();
                });
        }
    } else {
        showPage('login');
    }
});