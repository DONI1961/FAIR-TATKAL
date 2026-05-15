import socket
hosts = [
    "google.com",
    "ep-polished-hall-aqz5d0xv.us-east-1.neon.tech",
    "ep-polished-hall-aqz5d0xv-pooler.us-east-1.neon.tech"
]
for host in hosts:
    try:
        addr = socket.gethostbyname(host)
        print(f"Host {host} resolved to {addr}")
    except Exception as e:
        print(f"Failed to resolve {host}: {e}")
