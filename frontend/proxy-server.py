#!/usr/bin/env python3
"""
Simple proxy server to handle CORS and forward requests to n8n webhook
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse

class WebhookProxy(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        if self.path == '/webhook':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse incoming data
                data = json.loads(post_data.decode('utf-8'))
                print(f"Received message: {data.get('message', 'No message')}")
                
                # Forward to n8n webhook
                n8n_url = 'https://n8n.automation.doctor/webhook/echo'
                
                req = urllib.request.Request(
                    n8n_url,
                    data=post_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                try:
                    with urllib.request.urlopen(req) as response:
                        response_data = response.read().decode('utf-8')
                        
                        # If n8n returns empty response, create a default one
                        if not response_data:
                            response_data = json.dumps({
                                "response": "Webhook received your message. Note: n8n workflow needs to be configured to return a response."
                            })
                            print("n8n returned empty response, using default")
                        
                        # Send response back to client
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(response_data.encode('utf-8'))
                        
                except urllib.error.URLError as e:
                    print(f"Error forwarding to n8n: {e}")
                    error_response = {
                        "response": f"Error connecting to n8n webhook: {str(e)}"
                    }
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(error_response).encode('utf-8'))
                    
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"error": "Invalid JSON"}')
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, WebhookProxy)
    print(f"Proxy server running on http://localhost:{port}")
    print(f"Forward requests to http://localhost:{port}/webhook")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()