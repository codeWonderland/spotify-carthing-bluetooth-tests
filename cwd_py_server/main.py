from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess
import json
import re
import threading

class BluetoothRequestHandler(BaseHTTPRequestHandler):
    
    bluetoothctl_process = None

    @classmethod
    def start_bluetoothctl(cls):
        if cls.bluetoothctl_process is None:
            cls.bluetoothctl_process = subprocess.Popen(['bluetoothctl'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
            print("Started bluetoothctl process.")
        else:
            print("bluetoothctl process already running.")

    def run_bluetoothctl_command(self, command):
        if self.bluetoothctl_process is None:
            self.start_bluetoothctl()
        print(f"Sending command to bluetoothctl: {command.strip()}")
        self.bluetoothctl_process.stdin.write(command)
        self.bluetoothctl_process.stdin.flush()
        output = self.bluetoothctl_process.stdout.readline()
        print(f"Output from bluetoothctl: {output.strip()}")
        return output

    def clean_output(self, output):
        # Remove ANSI escape sequences
        ansi_escape = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')
        return ansi_escape.sub('', output)

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_headers()
        self.end_headers()

    def do_POST(self):
        self._set_headers()
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        post_data = json.loads(post_data)
        response = {}

        try:
            if self.path == '/bluetooth/agent':
                agent_mode = post_data.get('mode', 'NoInputNoOutput')
                self.run_bluetoothctl_command(f'agent {agent_mode}\n')
                self.run_bluetoothctl_command('default-agent\n')
                response = {'status': 'Agent set to ' + agent_mode}
            elif self.path == '/bluetooth/discoverable':
                state = post_data.get('state', '')
                command = f'discoverable {state}\n'
                output = self.run_bluetoothctl_command(command)
                clean_output = self.clean_output(output)
                response = {'output': clean_output}
            elif self.path == '/bluetooth/connect':
                device_mac = post_data.get('mac', '')
                command = f'connect {device_mac}\n'
                output = self.run_bluetoothctl_command(command)
                clean_output = self.clean_output(output)
                response = {'output': clean_output}
            elif self.path == '/bluetooth/pairing-response':
                pairing_response = post_data.get('response', 'no')
                command = f'{pairing_response}\n'
                output = self.run_bluetoothctl_command(command)
                clean_output = self.clean_output(output)
                response = {'output': clean_output}
            else:
                response = {'error': 'Invalid path'}

            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))


    def do_GET(self):
        self._set_headers()
        if self.path == '/bluetooth/check-updates':
            try:
                output = self.bluetoothctl_process.stdout.readline()
                response = {'output': self.clean_output(output)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                response = {'error': str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        elif self.path == '/bluetooth/active-media':
            try:
                output = self.run_bluetoothctl_command('info\n')
                media_info = self.extract_media_info(output)
                response = {'active_media': media_info}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                response = {'error': str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))

    def extract_media_info(self, output):
        # Extract media information from the bluetoothctl output
        lines = output.split('\n')
        media_info = {}
        for line in lines:
            if 'Player' in line:
                media_info['Player'] = line.split('Player: ')[1]
            elif 'Track' in line:
                media_info['Track'] = line.split('Track: ')[1]
            elif 'Album' in line:
                media_info['Album'] = line.split('Album: ')[1]
            elif 'Artist' in line:
                media_info['Artist'] = line.split('Artist: ')[1]
        return media_info


def run(server_class=HTTPServer, handler_class=BluetoothRequestHandler, port=8181):
    BluetoothRequestHandler.start_bluetoothctl()
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
