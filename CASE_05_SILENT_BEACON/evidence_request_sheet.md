# Case 05: Evidence Catalog & Investigation Guide

### Provided Technical Artifacts
| Artifact File | Description | Format | Recommended Tools |
| :--- | :--- | :--- | :--- |
| `artifacts/dns_tunnel.pcap` | Network capture of DNS traffic between workstation `10.0.5.44` and local DNS. | PCAP | Wireshark |
| `artifacts/dns_server.log` | Enterprise DNS server query log showing resolved/forwarded lookups. | Log text | VS Code, PowerShell, grep |
| `artifacts/endpoint_processes.csv` | Host process creation tree from Carlos Mendez's workstation (`AD-WS-14`). | CSV | Excel, VS Code |
| `artifacts/firewall.csv` | Edge firewall egress traffic logs showing allowed and denied connections. | CSV | Excel, PowerShell |

### Suggested Investigation Workflow
1. Open `firewall.csv` to see denied direct connections vs allowed UDP port 53 traffic.
2. Open `dns_tunnel.pcap` in **Wireshark** or inspect `dns_server.log` to find the anomalous C2 domain `c2.adversary-ops.example`.
3. Use **CyberChef** (Recipe: `From Base64`) on the subdomain strings to decode the exfiltrated text.
4. Map `endpoint_processes.csv` to trace the malicious payload spawned from Outlook.
