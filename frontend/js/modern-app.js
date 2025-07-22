// Modern Echo AI App - Perplexity + ChatGPT Style

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const N8N_WEBHOOK_URL = 'https://n8n.automation.doctor/webhook/echo';

// Auth State
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Chat State
let conversationHistory = [];
let currentConversationId = null;

// DOM Elements
let chatMessages, chatInput, sendBtn;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    checkAuth();
    setupEventListeners();
    initializeTheme();
});

function initializeElements() {
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('send-btn');
    
    // Initialize drag and drop for upload area
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('file-input').files = files;
                handleFileSelect({ target: { files } });
            }
        });
        
        uploadArea.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    }
}

function setupEventListeners() {
    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', () => autoResize(chatInput));
    }
}

// Authentication Functions
function checkAuth() {
    if (authToken) {
        if (authToken === 'demo-token') {
            currentUser = {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@echo.ai'
            };
            showPage('chat');
            document.getElementById('sidebar').style.display = 'flex';
        } else {
            // Verify real token
            verifyToken();
        }
    } else {
        showPage('login');
        document.getElementById('sidebar').style.display = 'none';
    }
}

async function login(event) {
    event.preventDefault();
    console.log('Login function called');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Email:', email, 'Password:', password);
    
    // Demo credentials
    if (email === 'demo@echo.ai' && password === 'demo123') {
        console.log('Demo credentials matched');
        authToken = 'demo-token';
        currentUser = {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@echo.ai'
        };
        localStorage.setItem('authToken', authToken);
        showPage('chat');
        document.getElementById('sidebar').style.display = 'flex';
        return;
    }
    
    // Real authentication would go here
    alert('Use demo@echo.ai / demo123 for testing');
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    conversationHistory = [];
    showPage('login');
    document.getElementById('sidebar').style.display = 'none';
}

// Page Navigation
function showPage(pageName) {
    console.log('Showing page:', pageName);
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
        console.log('Page found and activated:', pageName);
    } else {
        console.error('Page not found:', pageName);
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the corresponding nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${pageName}'`)) {
            item.classList.add('active');
        }
    });
}

// Make showPage function globally available
window.showPage = showPage;

// Also make other functions globally available
window.toggleTheme = toggleTheme;
window.refreshDashboard = refreshDashboard;
window.showNotification = showNotification;
window.uploadDocument = uploadDocument;
window.handleFileSelect = handleFileSelect;
window.viewDocument = viewDocument;
window.analyzeDocument = analyzeDocument;
window.saveSettings = saveSettings;
window.viewRiskDetails = viewRiskDetails;
window.implementMitigation = implementMitigation;
window.viewComplianceDetails = viewComplianceDetails;
window.updateComplianceStatus = updateComplianceStatus;
window.login = login;
window.logout = logout;
window.register = register;
window.sendMessage = sendMessage;
window.handleKeyDown = handleKeyDown;
window.toggleSidebar = toggleSidebar;
window.startNewChat = startNewChat;
window.clearChat = clearChat;
window.exportChat = exportChat;

// Chat Functions
async function sendMessage(event) {
    event.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Disable input while sending
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    // Add user message
    addMessageToChat(message, 'user');
    
    // Clear and reset input
    chatInput.value = '';
    autoResize(chatInput);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to webhook
    await sendMessageToWebhook(message);
    
    // Re-enable input
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
}

async function sendMessageToWebhook(message) {
    try {
        // Include conversation context
        const context = conversationHistory.slice(-10).map(m => ({
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
        
        hideTypingIndicator();
        
        if (response.ok) {
            let assistantMessage = 'I received your message but no response was provided.';
            
            try {
                const text = await response.text();
                if (text) {
                    const data = JSON.parse(text);
                    assistantMessage = data.response || data.message || assistantMessage;
                }
            } catch (e) {
                console.warn('Could not parse response:', e);
            }
            
            addMessageToChat(assistantMessage, 'assistant');
        } else {
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessageToChat('Sorry, I couldn\'t connect to the assistant. Please check your connection.', 'assistant');
    }
}

function addMessageToChat(message, sender) {
    if (!chatMessages) return;
    
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Store in history
    conversationHistory.push({
        role: sender === 'user' ? 'user' : 'assistant',
        content: message,
        timestamp: new Date().toISOString()
    });
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.id = messageId;
    
    // Create message content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (sender === 'user') {
        avatar.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 10a3 3 0 100-6 3 3 0 000 6z"/>
                <path d="M10 12c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>
            </svg>
        `;
    } else {
        avatar.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a3 3 0 00-3 3v1H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2V5a3 3 0 00-3-3zm0 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
                <circle cx="7" cy="13" r="1"/>
                <circle cx="13" cy="13" r="1"/>
            </svg>
        `;
    }
    
    // Message body
    const messageBody = document.createElement('div');
    messageBody.className = 'message-body';
    
    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (sender === 'assistant') {
        contentDiv.innerHTML = formatMessage(message);
        
        // Add copy buttons to code blocks
        setTimeout(() => {
            const codeBlocks = messageDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                const pre = block.parentElement;
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = () => copyCode(block.textContent, copyBtn);
                pre.appendChild(copyBtn);
            });
        }, 0);
    } else {
        contentDiv.textContent = message;
    }
    
    // Timestamp
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = timestamp;
    
    // Actions (for assistant messages)
    if (sender === 'assistant') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn';
        copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 4V12H10V4H4ZM4 2H10C11.1 2 12 2.9 12 4V12C12 13.1 11.1 14 10 14H4C2.9 14 2 13.1 2 12V4C2 2.9 2.9 2 4 2Z"/>
                <path d="M14 6V10C14 11.1 13.1 12 12 12V6H8C8 4.9 8.9 4 10 4H12C13.1 4 14 4.9 14 6Z" opacity="0.7"/>
            </svg>
            <span>Copy</span>
        `;
        copyBtn.onclick = () => copyMessage(message, copyBtn);
        
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'action-btn';
        regenerateBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.5 2.5A6 6 0 012.5 8M2.5 13.5A6 6 0 0113.5 8M12 2l1.5 1.5L15 2M1 14l1.5-1.5L4 14" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Regenerate</span>
        `;
        regenerateBtn.onclick = () => regenerateLastResponse();
        
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(regenerateBtn);
        messageBody.appendChild(actionsDiv);
    }
    
    // Assemble message
    messageBody.appendChild(contentDiv);
    messageBody.appendChild(timestampDiv);
    
    contentWrapper.appendChild(avatar);
    contentWrapper.appendChild(messageBody);
    
    messageDiv.appendChild(contentWrapper);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(message) {
    return message
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\s*)+/g, match => '<ul>' + match + '</ul>')
        // Code
        .replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Wrap in paragraphs
        .replace(/^(?!<[hpuol])(.+)$/gm, '<p>$1</p>');
}

function showTypingIndicator() {
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-content-wrapper">
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a3 3 0 00-3 3v1H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2V5a3 3 0 00-3-3zm0 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
                    <circle cx="7" cy="13" r="1"/>
                    <circle cx="13" cy="13" r="1"/>
                </svg>
            </div>
            <div class="message-body">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Utility Functions
function copyCode(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function copyMessage(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.querySelector('span').textContent = 'Copied';
        setTimeout(() => {
            button.querySelector('span').textContent = 'Copy';
        }, 2000);
    });
}

function regenerateLastResponse() {
    const lastUserMessage = conversationHistory.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
        // Remove last assistant message
        const messages = document.querySelectorAll('.chat-message.assistant');
        if (messages.length > 1) { // Keep the welcome message
            messages[messages.length - 1].remove();
            conversationHistory.pop();
        }
        
        showTypingIndicator();
        sendMessageToWebhook(lastUserMessage.content);
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        document.getElementById('chat-form').dispatchEvent(new Event('submit'));
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function startNewChat() {
    conversationHistory = [];
    if (chatMessages) {
        // Keep only the welcome message
        const messages = chatMessages.querySelectorAll('.chat-message');
        messages.forEach((msg, index) => {
            if (index > 0) msg.remove();
        });
    }
}

function clearChat() {
    if (confirm('Are you sure you want to clear this conversation?')) {
        startNewChat();
    }
}

function exportChat() {
    const chatContent = conversationHistory.map(msg => 
        `${msg.role.toUpperCase()}: ${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echo-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Placeholder functions for other features
function register(event) {
    event.preventDefault();
    alert('Registration would be implemented here');
}

function verifyToken() {
    // Token verification logic
}

// Document Management Functions
function uploadDocument(event) {
    event.preventDefault();
    const fileInput = document.getElementById('file-input');
    const docType = document.getElementById('doc-type').value;
    
    if (!fileInput.files.length) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    showNotification(`Uploading ${file.name} as ${docType}...`, 'info');
    
    // Simulate upload
    setTimeout(() => {
        showNotification('Document uploaded successfully!', 'success');
        addDocumentToList(file.name, file.size, docType);
        fileInput.value = '';
        resetUploadArea();
    }, 1500);
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const uploadArea = document.getElementById('upload-area');
        uploadArea.querySelector('p').textContent = `Selected: ${files[0].name}`;
        uploadArea.classList.add('file-selected');
    }
}

function addDocumentToList(fileName, fileSize, docType) {
    const docsList = document.querySelector('.documents-list');
    const newDoc = document.createElement('div');
    newDoc.className = 'document-item';
    newDoc.innerHTML = `
        <div class="doc-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
        </div>
        <div class="doc-details">
            <h4>${fileName}</h4>
            <p>Uploaded just now • ${formatFileSize(fileSize)}</p>
        </div>
        <div class="doc-actions">
            <button class="action-btn" onclick="viewDocument('${fileName}')">View</button>
            <button class="action-btn" onclick="analyzeDocument('${fileName}')">Analyze</button>
        </div>
    `;
    
    // Insert after the heading
    const heading = docsList.querySelector('h2');
    heading.insertAdjacentElement('afterend', newDoc);
}

function resetUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.querySelector('p').textContent = 'Drag and drop files here or click to browse';
    uploadArea.classList.remove('file-selected');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function viewDocument(fileName) {
    showNotification(`Opening ${fileName}...`, 'info');
}

function analyzeDocument(fileName) {
    showNotification(`Analyzing ${fileName} for compliance...`, 'info');
    setTimeout(() => {
        showNotification('Analysis complete. No issues found.', 'success');
    }, 2000);
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const lightIcon = document.querySelector('.theme-icon-light');
    const darkIcon = document.querySelector('.theme-icon-dark');
    
    if (lightIcon && darkIcon) {
        if (theme === 'light') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">×</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Dashboard Functions
function refreshDashboard() {
    showNotification('Refreshing dashboard data...', 'info');
    setTimeout(() => {
        showNotification('Dashboard updated!', 'success');
        updateMetrics();
    }, 1000);
}

function updateMetrics() {
    // Simulate metric updates
    const metrics = document.querySelectorAll('.metric');
    metrics.forEach(metric => {
        if (metric.textContent.includes('%')) {
            const current = parseInt(metric.textContent);
            const change = Math.floor(Math.random() * 5) - 2;
            metric.textContent = `${Math.max(0, Math.min(100, current + change))}%`;
        }
    });
}

// Settings Functions
function saveSettings(event) {
    if (event) event.preventDefault();
    showNotification('Settings saved successfully!', 'success');
}

// Risk Analysis Functions
function viewRiskDetails(riskId) {
    showNotification(`Loading risk details for ${riskId}...`, 'info');
}

function implementMitigation(mitigationId) {
    showNotification('Mitigation plan activated', 'success');
}

// Compliance Functions
function viewComplianceDetails(category) {
    showNotification(`Loading compliance details for ${category}...`, 'info');
}

function updateComplianceStatus(category) {
    showNotification('Compliance status updated', 'success');
}