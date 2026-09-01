# Case 05: The Silent Beacon

### Incident Scenario
At defense contractor **Aegis Dynamics**, the SOC perimeter firewall detected recurring denied outbound TCP connections to an unknown external IP (`198.51.100.77`). However, SIEM data volume metrics revealed that sensitive classified project blueprints (`PROJECT TITAN`) were still being leaked externally from endpoint `AD-WS-14` belonging to Systems Engineer Carlos Mendez.

Because all direct outbound HTTP/HTTPS ports are blocked on Carlos's subnet, the threat actor utilized an alternative covert channel.

### Investigation Objectives
1. **Identify the Covert Channel:** Determine the network protocol and technique used to bypass firewall egress restrictions.
2. **Wireshark PCAP Analysis:** Inspect `artifacts/dns_tunnel.pcap` in Wireshark and extract the high-frequency query domains.
3. **CyberChef Decoding:** Decode the subdomain chunks extracted from `dns_server.log` to reconstruct the exfiltrated plaintext message.
4. **Malware Origin & Process Lineage:** Trace the initial execution in `endpoint_processes.csv` from email attachment to the covert agent.
5. **C2 Infrastructure:** Identify the adversary's authoritative nameserver and C2 domain.
