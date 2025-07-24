// Knowledge Graph Visualization and Trust System

// Graph Data Structure
let graphData = {
    nodes: [
        { id: 'n1', label: 'Data Center Capacity', confidence: 98, type: 'critical', x: 400, y: 300 },
        { id: 'n2', label: 'Power Infrastructure', confidence: 95, type: 'high', x: 200, y: 200 },
        { id: 'n3', label: 'Cooling Systems', confidence: 92, type: 'high', x: 600, y: 200 },
        { id: 'n4', label: 'Regulatory Compliance', confidence: 88, type: 'high', x: 300, y: 400 },
        { id: 'n5', label: 'Project Timeline', confidence: 82, type: 'medium', x: 500, y: 400 },
        { id: 'n6', label: 'Budget Allocation', confidence: 75, type: 'medium', x: 150, y: 350 },
        { id: 'n7', label: 'Subcontractor Performance', confidence: 45, type: 'low', x: 650, y: 350 },
        { id: 'n8', label: 'Environmental Impact', confidence: 68, type: 'medium', x: 400, y: 150 },
        { id: 'n9', label: 'Safety Protocols', confidence: 94, type: 'high', x: 250, y: 500 },
        { id: 'n10', label: 'Supply Chain Status', confidence: 55, type: 'low', x: 550, y: 500 }
    ],
    edges: [
        { source: 'n1', target: 'n2', strength: 0.9 },
        { source: 'n1', target: 'n3', strength: 0.9 },
        { source: 'n1', target: 'n4', strength: 0.7 },
        { source: 'n1', target: 'n5', strength: 0.8 },
        { source: 'n2', target: 'n8', strength: 0.6 },
        { source: 'n3', target: 'n8', strength: 0.6 },
        { source: 'n4', target: 'n9', strength: 0.8 },
        { source: 'n5', target: 'n6', strength: 0.9 },
        { source: 'n5', target: 'n7', strength: 0.5 },
        { source: 'n6', target: 'n10', strength: 0.6 }
    ]
};

// Current view state
let currentView = 'network';
let selectedNode = null;
let confidenceFilter = 'all';

// Initialize Knowledge Graph
function initializeKnowledgeGraph() {
    renderGraph();
    setupGraphEventListeners();
    updateTrustScore();
}

// Render the graph visualization
function renderGraph() {
    const canvas = document.getElementById('knowledge-graph-canvas');
    if (!canvas) return;
    
    // Clear canvas
    canvas.innerHTML = '';
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 800 600');
    
    // Add edges
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'edges');
    
    graphData.edges.forEach(edge => {
        const sourceNode = graphData.nodes.find(n => n.id === edge.source);
        const targetNode = graphData.nodes.find(n => n.id === edge.target);
        
        if (shouldShowNode(sourceNode) && shouldShowNode(targetNode)) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourceNode.x);
            line.setAttribute('y1', sourceNode.y);
            line.setAttribute('x2', targetNode.x);
            line.setAttribute('y2', targetNode.y);
            line.setAttribute('stroke', '#444');
            line.setAttribute('stroke-width', edge.strength * 3);
            line.setAttribute('opacity', edge.strength);
            edgeGroup.appendChild(line);
        }
    });
    
    svg.appendChild(edgeGroup);
    
    // Add nodes
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'nodes');
    
    graphData.nodes.forEach(node => {
        if (!shouldShowNode(node)) return;
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node');
        g.setAttribute('data-node-id', node.id);
        g.style.cursor = 'pointer';
        
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', getNodeRadius(node));
        circle.setAttribute('fill', getNodeColor(node));
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        
        // Node label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 35);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#e8e8e8');
        text.textContent = node.label;
        
        // Confidence indicator
        const confidenceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        confidenceText.setAttribute('x', node.x);
        confidenceText.setAttribute('y', node.y + 5);
        confidenceText.setAttribute('text-anchor', 'middle');
        confidenceText.setAttribute('font-size', '14');
        confidenceText.setAttribute('font-weight', 'bold');
        confidenceText.setAttribute('fill', '#fff');
        confidenceText.textContent = node.confidence + '%';
        
        g.appendChild(circle);
        g.appendChild(text);
        g.appendChild(confidenceText);
        
        // Add uncertainty indicator for low confidence
        if (node.confidence < 50) {
            const warning = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            warning.setAttribute('x', node.x + 25);
            warning.setAttribute('y', node.y - 20);
            warning.setAttribute('font-size', '20');
            warning.setAttribute('fill', '#ffaa00');
            warning.textContent = '⚠️';
            g.appendChild(warning);
        }
        
        // Click handler
        g.addEventListener('click', () => selectNode(node));
        
        nodeGroup.appendChild(g);
    });
    
    svg.appendChild(nodeGroup);
    canvas.appendChild(svg);
}

// Get node radius based on importance
function getNodeRadius(node) {
    switch (node.type) {
        case 'critical': return 30;
        case 'high': return 25;
        case 'medium': return 20;
        case 'low': return 15;
        default: return 20;
    }
}

// Get node color based on confidence
function getNodeColor(node) {
    if (node.confidence >= 80) return '#00ff88';
    if (node.confidence >= 50) return '#ffaa00';
    return '#ff4444';
}

// Check if node should be shown based on filter
function shouldShowNode(node) {
    if (confidenceFilter === 'all') return true;
    if (confidenceFilter === 'high' && node.confidence >= 80) return true;
    if (confidenceFilter === 'medium' && node.confidence >= 50 && node.confidence < 80) return true;
    if (confidenceFilter === 'low' && node.confidence < 50) return true;
    return false;
}

// Select a node and show details
function selectNode(node) {
    selectedNode = node;
    showNodeDetails(node);
    highlightConnectedNodes(node);
}

// Show node details panel
function showNodeDetails(node) {
    const panel = document.getElementById('node-details');
    const title = document.getElementById('node-title');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceValue = document.getElementById('confidence-value');
    const sources = document.getElementById('node-sources');
    const updated = document.getElementById('node-updated');
    const connections = document.getElementById('node-connections');
    const description = document.getElementById('node-description');
    const uncertaintyNotice = document.getElementById('uncertainty-notice');
    const relatedList = document.getElementById('related-nodes-list');
    
    // Update panel content
    title.textContent = node.label;
    confidenceFill.style.width = node.confidence + '%';
    confidenceValue.textContent = node.confidence + '%';
    sources.textContent = Math.floor(node.confidence / 10 + 5);
    updated.textContent = '2 days ago';
    
    // Count connections
    const nodeConnections = graphData.edges.filter(e => 
        e.source === node.id || e.target === node.id
    ).length;
    connections.textContent = nodeConnections;
    
    // Update description
    description.textContent = getNodeDescription(node);
    
    // Show uncertainty notice for low confidence
    uncertaintyNotice.style.display = node.confidence < 50 ? 'flex' : 'none';
    
    // Update related nodes
    relatedList.innerHTML = '';
    const relatedNodes = getRelatedNodes(node);
    relatedNodes.forEach(relatedNode => {
        const span = document.createElement('span');
        span.className = 'related-node';
        span.textContent = relatedNode.label;
        span.onclick = () => selectNode(relatedNode);
        relatedList.appendChild(span);
    });
    
    // Show panel
    panel.style.display = 'block';
}

// Get node description based on type
function getNodeDescription(node) {
    const descriptions = {
        'n1': 'Core infrastructure metric tracking available capacity across all data centers. Critical for expansion planning.',
        'n2': 'Power distribution and backup systems ensuring 99.99% uptime requirements.',
        'n3': 'HVAC and cooling infrastructure maintaining optimal operating temperatures.',
        'n4': 'Compliance status with local, state, and federal regulations.',
        'n5': 'Master project schedule tracking all major milestones and dependencies.',
        'n6': 'Financial allocation across project phases and cost centers.',
        'n7': 'Performance metrics for contracted vendors and service providers.',
        'n8': 'Environmental impact assessments and sustainability metrics.',
        'n9': 'Safety protocol compliance and incident tracking.',
        'n10': 'Supply chain visibility and material availability tracking.'
    };
    return descriptions[node.id] || 'No detailed description available.';
}

// Get related nodes
function getRelatedNodes(node) {
    const relatedIds = new Set();
    graphData.edges.forEach(edge => {
        if (edge.source === node.id) relatedIds.add(edge.target);
        if (edge.target === node.id) relatedIds.add(edge.source);
    });
    return graphData.nodes.filter(n => relatedIds.has(n.id));
}

// Highlight connected nodes
function highlightConnectedNodes(node) {
    // Implementation for visual highlighting
    // This would update the SVG to emphasize connected nodes
}

// Close node details panel
function closeNodeDetails() {
    document.getElementById('node-details').style.display = 'none';
    selectedNode = null;
}

// Update overall trust score
function updateTrustScore() {
    const avgConfidence = graphData.nodes.reduce((sum, node) => sum + node.confidence, 0) / graphData.nodes.length;
    const scoreValue = document.querySelector('.trust-score-value');
    const scoreLabel = document.querySelector('.trust-score-label');
    const trustCircle = document.querySelector('.trust-meter circle:last-child');
    
    if (scoreValue) scoreValue.textContent = Math.round(avgConfidence) + '%';
    
    if (scoreLabel) {
        if (avgConfidence >= 80) scoreLabel.textContent = 'High Confidence';
        else if (avgConfidence >= 60) scoreLabel.textContent = 'Medium Confidence';
        else scoreLabel.textContent = 'Low Confidence';
    }
    
    // Update trust meter
    if (trustCircle) {
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (avgConfidence / 100) * circumference;
        trustCircle.style.strokeDashoffset = offset;
    }
}

// Setup event listeners
function setupGraphEventListeners() {
    // Confidence filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            confidenceFilter = this.dataset.confidence;
            renderGraph();
        });
    });
    
    // View mode buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Search nodes
function searchNodes(query) {
    if (!query) {
        renderGraph();
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    graphData.nodes.forEach(node => {
        const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
        if (nodeElement) {
            if (node.label.toLowerCase().includes(lowerQuery)) {
                nodeElement.style.opacity = '1';
            } else {
                nodeElement.style.opacity = '0.3';
            }
        }
    });
}

// Refresh graph data
function refreshGraph() {
    // Simulate data refresh
    showNotification('Refreshing knowledge graph...', 'info');
    setTimeout(() => {
        // Update some confidence values to simulate real-time updates
        graphData.nodes.forEach(node => {
            const change = (Math.random() - 0.5) * 10;
            node.confidence = Math.max(0, Math.min(100, node.confidence + change));
        });
        renderGraph();
        updateTrustScore();
        showNotification('Knowledge graph updated', 'success');
    }, 1000);
}

// Set graph view mode
function setGraphView(view) {
    currentView = view;
    if (view === 'ranking') {
        document.querySelector('.graph-visualization').style.display = 'none';
        document.querySelector('.variables-ranking').style.display = 'block';
    } else {
        document.querySelector('.graph-visualization').style.display = 'block';
        document.querySelector('.variables-ranking').style.display = 'none';
        renderGraph(); // Re-render for different layouts
    }
}

// Toggle graph view
function toggleGraphView() {
    const views = ['network', 'hierarchy', 'ranking'];
    const currentIndex = views.indexOf(currentView);
    const nextView = views[(currentIndex + 1) % views.length];
    setGraphView(nextView);
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === nextView) {
            btn.classList.add('active');
        }
    });
}

// Export functions for global use
window.initializeKnowledgeGraph = initializeKnowledgeGraph;
window.searchNodes = searchNodes;
window.refreshGraph = refreshGraph;
window.setGraphView = setGraphView;
window.toggleGraphView = toggleGraphView;
window.closeNodeDetails = closeNodeDetails;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('knowledge-graph-canvas')) {
        initializeKnowledgeGraph();
    }
});