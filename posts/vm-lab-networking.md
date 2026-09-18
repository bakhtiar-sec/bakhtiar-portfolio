---
title: "Where Do VMs Get Their IPs? The Question Every Security Beginner Asks"
summary: "You booted Kali, ran ip a, and saw an IP you never set. Where did it come from? NAT, DHCP, reverse shells, and the receptionist analogy — everything a first lab needs, minus the jargon."
tags: [networking, beginners, lab-setup, virtualization, learning-in-public]
---

## The moment every beginner hits

You finally set up your security lab. Kali is installed, Metasploitable is ready. You run `ip a` and see something like `192.168.216.129`.

You never configured that. So… whose IP is it? Where did it come from? And why does every tutorial just say "use NAT mode" like you were born knowing what that means?

I hit this exact wall. This post is the explanation I wish existed — no jargon first, pictures first, terms only after they make sense.

## The one idea: your laptop becomes a router

When your phone joins home WiFi, it gets an IP automatically. You never set it — something just hands it out. That "IP-giver" is called **DHCP**.

Here's the magic: when you install VMware or VirtualBox, it builds a fake mini-network inside your laptop.

- Your laptop becomes the router
- Your VMs become devices joining that network

```text
Home router (real)   → gives your laptop its real IP
Laptop (plays router) → VMware gives VMs their FAKE IPs
```

So when your Kali VM boots and gets an address in that range — that's **VMware's built-in IP-giver answering the VM's "what's my IP?" shout.** The IP was born inside your laptop. It's an internal office extension, not a public address.

> **Your number will look different, and that's fine.** VMware picks a random `192.168.x.0/24` subnet when it installs, so your third octet almost certainly isn't mine. VirtualBox's default NAT hands out `10.0.2.15` to *every* VM. Nothing is broken — the range is arbitrary, the idea is what matters.

## The receptionist analogy (NAT without saying NAT)

Think of your laptop's real IP as the building's **public phone number**, and the VM as **extension 201** inside.

- The outside world can only call the building's public number — extension 201 doesn't exist out there
- When ext. 201 wants to call the outside world, it dials through the receptionist — who places the call using the building's public number
- Replies come back to the receptionist, who remembers: *"ah, this is for ext. 201"* — and passes it in

The outside world **never sees the VM's IP — only your laptop's real one.** That translation trick is called **NAT**, and it's the same pattern running the entire internet: billions of devices hiding behind millions of shared public IPs.

Notice what the receptionist does *not* do: stop ext. 201 from dialing out. Hold onto that. It's the whole point of the safety section later.

## "So can anything on the internet reach my VM?"

Great instinct to ask — because "impossible" is always a configuration, not a law. There are exactly two ways it happens:

**Way 1 — someone opened a door from the inside (port forwarding).** The building owner puts a sign at the gate: *"visitors asking for ext. 201 → send them up."* That's a router rule mapping outside requests to your VM. Every Minecraft server run by a 14-year-old is this door, opened on purpose. And the door doesn't recognize good guys from bad.

**Way 2 — the return-call trick.** Rule of telephony: if YOU call out, replies on that line are allowed back in. So if a trickster gets ext. 201 to call *him* first — a shady file clicked inside the VM — his "reply" rides the open line straight back in. He never dialed in. **He was called, and he talked back.**

If Way 2 clicked for you, congratulations: you just understood the **reverse shell** — why real-world malware doesn't wait to be connected to, but "calls home" instead. It's not style. It's the only direction that reliably gets through.

And it explains an entire industry: attackers love **HTTPS (port 443)** for their call-home traffic because it's (a) allowed almost everywhere — blocking it breaks the internet for everyone, and (b) encrypted — defenders usually can't read what's being said. Firewalls control *direction*; encryption hides *content*. An attacker who fits both constraints slips past most defenses.

One honest caveat: "encrypted means unreadable" holds on your home network, but many corporate networks run **TLS inspection** — they install their own root certificate on company machines and decrypt traffic at the perimeter on purpose. That, along with egress filtering and DLP, exists precisely because of this hole.

## NAT vs Bridged vs Host-only, finally in one picture

Now the network modes make sense — they're just staffing choices for the receptionist:

**NAT (default):** receptionist active. The VM has a fake extension and borrows the laptop's real number. Nothing from outside can reach in uninvited — but the VM can still call **anywhere**: your home router, other devices on your WiFi, the public internet.

**Bridged:** receptionist fired. The VM joins your **real home WiFi** — the actual router gives it a real LAN IP, a sibling of your laptop's. It's now a full network citizen, reachable *from* other devices on your WiFi. Great for realism — and it means a bridged Kali is a visible attacker machine on a real network. Use only when you mean it.

**Host-only:** the building has no gate at all. VMs talk to each other and to you, and nothing goes in or out. Maximum isolation — this is the real sandbox.

> **VMware and VirtualBox differ here, and tutorials rarely say so.** VMware's NAT (vmnet8) is a shared segment: your Kali and your Metasploitable can see each other. VirtualBox's default **NAT** gives each VM its own private NAT engine — VMs get outbound access but **cannot reach each other**, which is why your first `nmap` at your other VM returns nothing. For a VirtualBox lab you want **NAT Network** (shared, outbound allowed) or **Host-only** (shared, sealed). VirtualBox also has **Internal Network**: sealed like host-only, but your host can't reach the VMs either.

## The lab-safety rule (read this before your first scan)

Here's the part I want every beginner to read twice — and the part I originally got wrong myself.

**NAT is not a sandbox.** NAT blocks *inbound* connections. It does absolutely nothing to stop *outbound* ones. A Kali VM in NAT mode can scan your router, your flatmate's laptop, the office printer, and any public IP on the internet — and because the traffic is translated to your host's address, the target's logs show **your** real IP doing it. "It was in a VM" is not a defence anyone has ever accepted.

So the rule, properly:

- **Host-only (or Internal Network):** genuinely sealed. Packets cannot leave your laptop. Scan, exploit, and break things freely. This is where a first lab belongs.
- **NAT / NAT Network:** safe **only** when your target is another VM on that same virtual segment. The moment you type an address that isn't one of your VMs — your gateway, a LAN device, a public host — that is real traffic on someone else's network.
- **Bridged:** you are a device on a real network, indistinguishable from any other. Authorization first, always.

A practical habit: give your lab VMs a host-only adapter for attack traffic, and only switch to NAT temporarily when a VM needs to download updates. Internet access and attack surface don't need to be on at the same time.

Practising on your own intentionally-vulnerable VMs (Metasploitable, DVWA) is how everyone learns. The moment a target isn't yours — a company site, a public app, even "just the login page" — you need written permission. Not because curiosity is wrong, but because **permission is what separates a security professional from a criminal.** CEH's first lesson, and the only one that protects your career.

## TL;DR

- VMs get IPs from the hypervisor's **built-in DHCP** — your laptop plays router
- VM IPs are internal extensions; the world sees your laptop's real IP (**NAT**)
- Internet → VM is blocked by default, but reachable via **port forwarding** (opened doors) or **reverse shells** (riding outbound calls home)
- **NAT blocks inbound only.** Outbound scans from a NAT'd VM are real traffic carrying your real IP
- **Host-only** = the actual sandbox, **NAT** = safe only against your own VMs, **bridged** = real network citizen
- Scan your own lab freely; anywhere else, written authorization first

— Shaik Abdul Bakhtiar · CEH v13 · learning in public