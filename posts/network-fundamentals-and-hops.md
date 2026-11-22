---
title: Network Fundamentals and Network Hops: Follow One Packet End to End
date: 2026-11-23
tags: networking, beginners, security
summary: Networks, devices, the OSI model and encapsulation, then a step-by-step trace of one packet across a router, showing exactly which fields change at every hop.
---

These are my study notes on networking fundamentals, rewritten as a quick-recall reference. The first half covers what a network is, the devices in it, the OSI model and encapsulation, and it is free to read. The second half is a deep dive that follows one packet across a router, field by field. It sits behind a free unlock at the end of the fourth section.

# What a network is

A **network** is a group of devices connected by communication links (cable, fibre, Wi-Fi) so they can exchange data.

The **Internet** is short for *internetwork*: a global system of many separate networks, owned by different organizations and connected to each other. All of them use the same rules (TCP/IP) and the same addressing system (public IP addresses), so they can exchange data globally. Put simply, it is a network of networks.

## Two myths to drop early

- **The Internet is not the Web.** The Web (websites over HTTP/HTTPS) is one service that runs on the Internet. Email, SSH, DNS, online games, video calls and file transfer also run on it, and none of them is the Web.
- **Wi-Fi is not the Internet.** Wi-Fi only connects your devices to a local network (your router). Wi-Fi can work perfectly with no Internet if the ISP link is down, and your phone and laptop can still talk to each other.

> **Recall:** Network = devices + links. Internet = a network of networks that share TCP/IP and public IP addresses. The Web and Wi-Fi are not the Internet.

# The devices in a network

- **NIC (network interface card).** The hardware or virtual component that connects a device to a network. Every NIC has a unique hardware address called a MAC address.
- **Hub.** Not a smart device. It sends every incoming signal to all other ports without checking who the data is for.
- **Switch.** Connects devices inside the same network (LAN) and forwards data only to the port of the intended receiver, using MAC addresses. It keeps a MAC address table of which MAC is on which port.
- **Router.** Connects different networks and forwards data between them using IP addresses and a routing table. It decides the next best step for each packet.
- **Modem.** Converts your digital data into the signal type your ISP's line uses (cable, fibre, telephone line) and converts it back. The name comes from modulator + demodulator.
- **Access point (AP).** Lets wireless devices connect to a wired network. In a big office, many APs sit on the ceiling, all cabled to the nearest switch.
- **Firewall.** A security device or software that allows or blocks traffic based on rules such as source and destination IP, port and protocol. Example rule: allow incoming traffic on port 443 to the web server, block everything else. A network firewall is a separate device between networks, for example between the Internet and a company network. A host firewall is software on one device, such as Windows Defender Firewall.

> **Recall:** Switch = inside a network. Router = between networks. A hub repeats to everyone. The modem talks to the ISP line. An AP adds wireless. A firewall filters by rule.

# The OSI model on one page

The OSI (Open Systems Interconnection) model is a conceptual framework created by ISO. It divides network communication into 7 layers, each with one specific job, and describes how data is wrapped layer by layer on the sender and unwrapped layer by layer on the receiver. It gives you a common language ("this is a layer 2 problem"), faster troubleshooting (check one layer at a time) and clear responsibility for each technology.

OSI is a model for understanding, not software. Real networks run on the TCP/IP model, which has 4 layers.

- **7 Application:** gives network services to user software. Unit: data. Examples: HTTP/HTTPS, SSH, DNS.
- **6 Presentation:** formats, encrypts and compresses data. Unit: data. Example: TLS.
- **5 Session:** starts, manages and ends a conversation. Unit: data.
- **4 Transport:** delivers data between programs using ports. Unit: segment (TCP) or datagram (UDP).
- **3 Network:** addresses and routes packets between networks. Unit: packet. Examples: IP, ICMP, routers.
- **2 Data link:** delivers frames to the next device on the same network using MAC addresses. Unit: frame. Examples: Ethernet, ARP, switches.
- **1 Physical:** sends raw bits as signals. Unit: bits. Examples: cables, radio, the NIC.

Quick rule for choosing a layer: if it uses a MAC address, it is layer 2. An IP address, layer 3. A port number, layer 4. If it is carried inside TCP/UDP to serve an application, layer 7. In OSI teaching TLS is placed at layer 6 because its job is encryption, but in real networks it sits between HTTP and TCP.

Keep two ideas separate. **Connection setup** asks what must exist before data can be sent, and it goes bottom-up: DNS, then TCP, then TLS. **Data flow** asks what happens to one message: it is wrapped from layer 7 down to layer 1 on the sender, and unwrapped from layer 1 up to layer 7 on the receiver.

> **Recall:** Application, Presentation, Session, Transport, Network, Data link, Physical. MAC = layer 2, IP = layer 3, port = layer 4. OSI is the model, TCP/IP is what runs.

# How data gets wrapped

Four terms to be precise about:

- **Protocol:** a set of agreed rules that defines the format of messages and how two systems must behave when they exchange them. It is a rulebook, not a program.
- **Implementation:** the actual code or hardware that follows a protocol's rules. TCP is a protocol, and the OS kernel's TCP code is the implementation.
- **Encapsulation:** each layer wraps the data from the layer above with its own header (layer 2 also adds a trailer). It treats the inner data as an unreadable payload. **Decapsulation** is the receiver removing the wrappers in reverse order.
- **PDU (protocol data unit):** the unit of data at one layer, which is that layer's header plus the payload from above.

Step through the wrapping on the sender:

```
@widget encap
```

> **Recall:** Each layer adds its own header around the payload from above. Layer 2 also adds a trailer. The receiver strips them in reverse order.

[[gate]]

# Where each job runs

A **socket** is an endpoint the OS creates so a program can send and receive network data. It is the doorway between a program and the kernel's network code. Normal programs such as Chrome run in **user space** with limited power. The **kernel** is the core of the OS, with full control of the hardware and the network code.

- **HTTP, JSON, JPEG:** done by the application (Chrome), in user space.
- **TLS encryption:** done by a TLS library inside the app (Chrome uses BoringSSL), in user space.
- **TCP, IP, ICMP, ARP, frame building:** done by the operating system, in the kernel network stack.
- **Bits to signals:** done by the NIC driver (OS code) and the NIC hardware.

The app never builds segments or frames. It hands bytes to the kernel through a socket. One exception: HTTP/3 uses QUIC, which runs over UDP and is implemented inside Chrome itself. These notes describe classic HTTPS over TCP. TLS is usually drawn at layers 5 to 6, but it is not a clean OSI layer. What matters is that it sits between the app and TCP.

# Segment, packet, frame

They are nested boxes. Each one is the same data with one more header added.

```
@ascii
| Eth 14 B | IP 20 B | TCP 20 B | data ≤ 1460 B | FCS 4 B |
|<------------------- frame (Layer 2) ------------------->|
           |<-------- packet (Layer 3) -------->|
                     |<-- segment (Layer 4) --->|
```

- **Segment (layer 4):** a chunk of the data stream plus a TCP header (source port, destination port, sequence number, flags, checksum). It identifies which program the data belongs to and keeps delivery reliable and ordered. With UDP the unit is called a datagram. A segment lives between two end programs.
- **Packet (layer 3):** a segment plus an IP header (source IP, destination IP, TTL, protocol, header checksum). It identifies which host the data goes to across networks. A packet lives for the whole journey. Only the TTL and the header checksum change on the way, plus addresses and ports wherever NAT is involved.
- **Frame (layer 2):** a packet plus an Ethernet header (destination MAC, source MAC, EtherType) and a trailer (FCS). It identifies which device on this one link gets it next. A frame lives for one hop only: every router discards it and builds a new one.
- **Bits (layer 1):** the whole frame is converted into 1s and 0s, then into signals (voltage, light or radio waves). Every field is just a binary number.

Sizes: TCP header 20 bytes minimum, IPv4 header 20 bytes minimum, Ethernet header 14 bytes, FCS 4 bytes. The MTU (maximum frame payload) is 1500 bytes, so the maximum segment size is 1500 − 20 − 20 = 1460 bytes of data per segment.

> **Recall:** Segment = TCP header + data. Packet = IP header + segment. Frame = Ethernet header + packet + FCS. A frame lives for one hop, a packet for the whole trip.

# MAC vs IP vs port

```
@ascii
                MAC address         IP address          Port
Layer           2 (data link)       3 (network)         4 (transport)
Identifies      an interface        a host on a         a program
                on one link         network             on a host
Size            48 bits (6 B)       32 bits (4 B)       16 bits (2 B)
Example         AA:BB:CC:DD:EE:FF   192.168.1.10        443
Assigned by     manufacturer        DHCP or admin       OS or server config
Scope           one hop             end to end          inside one host
Lives in        frame header        packet header       segment header
Read by         switch, NIC         router, kernel IP   kernel TCP/UDP
Changes/hop     yes                 no (NAT aside)      no (NAT/PAT aside)
```

Memory line: the MAC answers "which device on the link", the IP answers "which host on the network", and the port answers "which program on that host".

## Subnets and the default gateway

**Subnetting** splits a large network into smaller, manageable networks called subnets. For example, home devices might use 192.168.1.x while guest Wi-Fi and security cameras use 192.168.2.x. Devices on different subnets cannot talk to each other directly. They must go through a router, by way of the default gateway.

The **default gateway** is the IP address of a router interface, configured on the host. The host sends it every packet whose destination is not on its own subnet. A host only knows how to deliver directly on its own local network (using ARP and frames), and it cannot store routes for the whole Internet. So it needs the MAC address of just one device, the gateway, and one ARP entry covers the entire Internet.

How laptop A (192.168.1.10, mask 255.255.255.0) decides local or remote is a binary AND of the address with the mask:

```
@ascii
192.168.1.10   11000000.10101000.00000001.00001010
mask           11111111.11111111.11111111.00000000
AND            11000000.10101000.00000001.00000000  = 192.168.1.0 (own network: local)

10.0.0.5       00001010.00000000.00000000.00000101
mask           11111111.11111111.11111111.00000000
AND            00001010.00000000.00000000.00000000  = 10.0.0.0 (different: remote)
```

## When DHCP runs out

When every IP address in the DHCP pool has been handed out, a new device has nothing to receive. It broadcasts a request for an address and gets no answer. The result is a device stuck on "Obtaining IP address", or one that joins Wi-Fi but shows "no internet connection".

If you check such a device you may see an address starting with 169.254. That is APIPA (Automatic Private IP Addressing). The device gives up waiting and assigns itself an emergency address in that range just to have something. It only works on the local link, so there is no Internet.

> **Recall:** Same subnet = deliver directly with ARP. Different subnet = send to the default gateway. A 169.254.x.x address means DHCP never answered.

# Helper protocols: ARP, ICMP, TTL, FCS

- **ARP (Address Resolution Protocol):** finds the MAC address that belongs to a known IP address on the same local network. The sender broadcasts "Who has this IP?", the owner replies with its MAC, and the answer is kept in the ARP cache.
- **ICMP (Internet Control Message Protocol):** a layer 3 helper protocol that devices use to report errors and test reachability. It travels inside an IP packet (protocol number 1) and has no ports. It reports problems but never fixes them. `ping` uses echo request and echo reply. `traceroute` uses TTL expiry: each router that drops a packet sends back "Time Exceeded", which reveals the path. The message carries the IP of the device that sent it, so it shows where the problem was reported, not always the host's fault. No reply does not prove a host is down, because firewalls often block ICMP.
- **TTL (Time To Live):** a counter in the IP header that drops by 1 at every router. At 0 the packet is dropped, which stops endless loops.
- **FCS (Frame Check Sequence):** the last 4 bytes of a frame, holding a CRC-32 value calculated from the frame's other bytes. The receiver recalculates it, and if the value differs the frame is damaged and dropped. It detects accidental errors, not attacks, because anyone can recompute a checksum.

Three checks, three layers: the FCS covers the frame, the IP header checksum covers the IP header only, and the TCP checksum covers the segment.

> **Recall:** ARP maps IP to MAC on one LAN. ICMP reports, it never repairs. TTL stops loops. FCS catches accidents, not attackers.

# The host routing table

Every host has a routing table, not only routers. It is a list of routes stored in the kernel. Each rule says: for destinations in this network, send the packet to this next hop out of this interface. The kernel's IP code checks the table for every outgoing packet. A laptop's table is usually small, around 2 to 5 entries.

- **Destination:** the network the rule covers.
- **Prefix length / mask:** how many leading bits of the destination must match (/24 = 255.255.255.0).
- **Gateway (next hop):** the IP of the next device to forward to. It shows on-link (Windows) or no value if the network is directly attached.
- **Interface:** which NIC to send out of, for example eth0.
- **Metric:** a cost number. Lower is preferred when two routes tie.

```
@ascii
Destination     Prefix  Next hop       Interface  Metric
0.0.0.0         /0      192.168.1.1    eth0       100
192.168.1.0     /24     on-link        eth0       100
```

A prefix length is the number of leading bits that identify the network:

```
@ascii
/0   0.0.0.0          matches every address (the default route)
/8   255.0.0.0        first number must match
/16  255.255.0.0      first two numbers must match
/24  255.255.255.0    first three numbers must match
/32  255.255.255.255  exactly one address
```

Three kinds of route:

- **Connected (on-link) route:** created automatically when an IP and mask are set on an interface. It exists because the host is directly attached to that network, so delivery is direct.
- **Default route (0.0.0.0/0):** created by DHCP or gateway configuration. This is the entry that makes the default gateway work. It has prefix length 0, so zero bits must match and it covers every possible destination. It is the least specific route and is only used when no specific route matches.
- **Specific (static) route:** added manually by an admin or by DHCP, for a particular network via a particular next hop.

**Longest prefix match:** when more than one entry matches a destination, the kernel picks the entry with the longest prefix. Step 1: find all matching entries. Step 2: choose the longest prefix. For the printer 192.168.1.20, both 0.0.0.0/0 (prefix 0) and 192.168.1.0/24 (prefix 24) match. The /24 is longer, so it wins: the route is on-link and A uses ARP for the printer directly. The gateway is not involved. For the server 10.0.0.5, only the default route matches, so the next hop is 192.168.1.1.

> **Recall:** Every host has a routing table. Matching entries compete, and the longest prefix wins. The default route is /0 and matches only when nothing else does.

# Trace one packet across a router

Setup: laptop A (192.168.1.10, MAC AA) sends an HTTPS request to server B (10.0.0.5, MAC BB). The router's left interface is 192.168.1.1 (MAC R1) and its right interface is 10.0.0.1 (MAC R2). A's gateway is 192.168.1.1. Use Next to step through, and watch the highlighted fields.

```
@widget hops
```

What changed and what did not:

- **Changes at every hop:** the MAC addresses. Each hop builds a new frame addressed to the next device on that link.
- **Changes once per router:** the TTL (minus 1) and the IP header checksum.
- **Does not change:** the source and destination IP, and the ports, unless NAT is involved.
- **Why the first frame is addressed to the router:** the MAC always names the next hop on the link, not the final destination. A uses the gateway's MAC even though it is sending to the server.

If the destination had been the printer at 192.168.1.20, the mask test would say local, A would ARP for the printer and address the frame to the printer's MAC, and the switch would deliver it straight there. The gateway would not be involved.

> **Recall:** MACs name the next hop and change every hop. IPs name the final host and stay the same. Routers de-encapsulate, decrement the TTL, look up the route, then re-encapsulate in a new frame.

# Security angle: attacking the LAN and the hops

The default gateway is a choke point. Every packet leaving your LAN goes to it, so an attacker who can pretend to be the gateway's MAC sits in the middle of all your traffic.

## ARP spoofing in four steps

1. ARP has no authentication. Any device on the LAN can send a reply, and most hosts accept it.
2. The attacker sends a fake reply: "192.168.1.1 is at the attacker's MAC".
3. A updates its ARP cache and starts sending its frames to the attacker instead of the router.
4. The attacker forwards them to the real router, so everything still seems to work. This is a man-in-the-middle (MITM) attack.

**What the attacker gets:** metadata (who you talk to, and when), unencrypted traffic (plain HTTP and old protocols), and the ability to drop or tamper with traffic or fake DNS answers. **What TLS still protects:** the contents of properly validated HTTPS. The attacker sees only ciphertext, and a fake certificate triggers a browser warning. This is why encryption and network attacks are separate topics.

## Other weak points

- **Same LAN means direct access.** Devices on the same LAN talk to each other through the switch, so no router and no firewall sees that traffic. A compromised camera on 192.168.1.x can reach the laptop directly.
- **MAC flooding.** The attacker sends thousands of frames with fake source MACs to fill the switch's MAC table. A full switch may start flooding frames out of all ports, so the attacker can sniff other people's traffic.
- **Rogue gateway through DHCP.** A host usually gets its gateway automatically from DHCP. An attacker running a rogue DHCP server can answer faster than the real one and hand out their own IP as the default gateway.
- **A compromised router.** The gateway sees all metadata and can change DNS settings or routing. A hacked home router is a serious breach.

## Defence summary

```
@ascii
ARP spoofing        Dynamic ARP Inspection (DAI) on managed switches, a static ARP
                    entry for the gateway on critical machines, detection (arpwatch)
MAC flooding        Port security (limit the MACs allowed per port)
Rogue DHCP          DHCP snooping (the switch trusts DHCP replies only from the router's port)
Lateral movement    VLANs and segmentation (cameras, fridges and IoT on a separate network)
Traffic inspection  HTTPS everywhere, VPN on untrusted networks
```

> **Recall:** ARP and DHCP trust whoever answers first. Defend with DAI, DHCP snooping, port security and segmentation, and assume the LAN is hostile by encrypting everything.
