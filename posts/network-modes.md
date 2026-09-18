---
title: "NAT vs Host-only vs Bridged: What Each One Actually Does (Tested, Not Just Read)"
date: 2025-12-20
summary: "Every VM has a network mode, and most beginners pick one because a tutorial said so. Here's what NAT, Host-only, and Bridged actually do under the hood — with the commands to prove each claim on your own machine."
tags: [networking, beginners, lab-setup, virtualization, learning-in-public]
---

## Three modes, one dropdown, very different behavior

Every hypervisor — VMware, VirtualBox, whatever you're running — asks the same question when you set up a VM: how should this thing connect to the network? The dropdown usually has three real options: **NAT**, **Host-only**, and **Bridged**. Most beginners pick whichever one the tutorial says and move on.

That's a mistake for a security lab specifically, because these three modes decide **where your attack traffic is allowed to go** — and getting that wrong is the difference between "safe practice environment" and "unauthorized traffic on someone else's network." So here's what each mode actually does, and the exact commands to verify it yourself rather than take it on faith.

## NAT: full outbound access, no inbound access

**What it is:** Your VM gets a private IP from the hypervisor's own DHCP server, and the hypervisor sits between the VM and the real world, translating traffic in both directions — the VM's outbound packets leave wearing your host machine's address, and any replies get routed back to the right VM.

**What people assume:** That this makes the VM "contained." It doesn't.

**What's actually true:** NAT blocks unsolicited traffic from **coming in**. It does nothing to stop the VM from going **out**. A VM in NAT mode can scan your router, another device on your WiFi, or a public website on the internet — and because of the translation, the target sees your host's real IP as the source. "It was running in a VM" isn't a defense anyone accepts, because from the outside, it wasn't.

**Proof it, don't take it on faith.** Boot your VM in NAT mode and run:

```
ping 8.8.8.8
```

It succeeds — full internet reachability. Then, to see the translation happening rather than just trusting it's there, run a packet capture on your host machine's real network interface while the VM pings:

```
sudo tcpdump -i <your-host-interface> icmp
```

You'll see the ICMP packets leave carrying **your host's IP**, not the VM's private address. That's the entire mechanism, visible on the wire.

## Host-only: no internet access, period

**What it is:** The hypervisor creates a private network shared by your host machine and any VMs on it — but that network has no path out to the internet at all.

**The part that trips people up:** the VM still gets an IP address. That looks like it should mean *some* kind of connectivity, so it's easy to assume host-only is "half-open." It isn't — having an IP and having internet access are two separate things.

**Why:** DHCP (the thing handing out the IP) and routing to the internet are different jobs. The hypervisor's private DHCP server exists purely so devices on that segment — your host, your VMs — can find each other. It has nothing to do with the internet. Internet access requires a second, separate thing: a **default route**, a line that says "for anything outside my local subnet, send it here." Host-only mode gives you the first and never builds the second.

**Proof it.** Inside the VM:

```
ping 8.8.8.8
```

Every packet times out. Then check *why*:

```
ip route
```

You'll see a local subnet route (e.g. `192.168.20.0/25 dev eth0`) — that's just the neighborhood. Now check for the actual gateway:

```
ip route | grep default
```

Nothing. No default gateway exists, which is the real reason `8.8.8.8` is unreachable — not a filter blocking it, just no road leading there.

One more thing to verify: your host machine can still reach the VM directly, because host-only isolates the VM from the **internet**, not from you.

```
ping <VM's IP address>
```

from your host terminal — succeeds. Sealed from the outside world, wide open to you. That's the design, not a leak.

## Bridged: your VM becomes a real device on your real network

**What it is:** The VM's virtual network adapter is bridged directly onto your physical WiFi or ethernet adapter. The VM asks your **actual router** for an IP, the same way any other device on your network would, and gets its own independent address — a sibling of your host machine's, not a clone of it.

**Common misconception:** that bridged mode somehow shares your host machine's IP. It doesn't — the VM gets its own address entirely, issued by your router.

**Why this is the one to be careful with:** in NAT and host-only, your VM lives on a private network your hypervisor controls. In bridged mode, it's a full peer on your real WiFi — visible to, and reachable by, every other device on that network, exactly like your laptop is. There's no built-in sandboxing here at all.

**This is the mode where authorization matters.** Scanning your own lab VMs in NAT or host-only never leaves your machine (host-only) or only touches things you've deliberately reached (NAT). Bridged puts your attacking machine on a real, shared network — the same rule applies as scanning anything else: written permission first, always.

## Why reverse shells and port forwarding only matter in one mode

Two well-known ways to reach a VM that's normally unreachable from outside:

- **Port forwarding** — a rule that maps a port on your host to a port on the VM. This is a NAT-specific feature; it exists to punch a hole through the NAT gateway. Host-only has no NAT gateway to punch a hole through, so this mechanism isn't available there in the same form.
- **Reverse shells** — the VM makes an outbound connection, and the attacker's replies ride back in on that same connection. This requires the VM to have a default route out. In host-only mode, there is none — so there's nothing for a reverse shell to dial out through.

That's the real distinction: **NAT's inbound protection is a default that can be deliberately overridden (port forwarding) or bypassed by the direction of the traffic (reverse shells). Host-only's protection is structural — the plumbing for either attack doesn't exist.** That's why host-only, not NAT, is the correct resting state for a lab VM you're actively attacking.

## Quick reference

| Mode | Gets an IP from | Internet access | Reachable from your host | Use case |
|---|---|---|---|---|
| **NAT** | Hypervisor's DHCP | Yes (outbound only) | Yes | VM needs updates/internet, not actively under attack |
| **Host-only** | Hypervisor's DHCP | No | Yes | Attacking/scanning your own lab VMs |
| **Bridged** | Your real router | Yes (full peer) | Yes, like any LAN device | Realism testing, with authorization |

## The habit worth keeping

Set your lab VMs to host-only as the default. Switch to NAT only briefly when a VM needs to pull updates, then switch back. Never point an attack at a bridged VM, or anything reachable through one, without permission — bridged mode makes your VM a visible, ordinary citizen of whatever network it's plugged into, and the internet doesn't distinguish "just practicing" from "unauthorized."

And whatever a tutorial — or an AI, or a blog post, including this one — tells you a network mode does: run the four commands above and watch it happen. It takes five minutes and it's the difference between knowing something and having been told something.

— Shaik Abdul Bakhtiar · CEH v13 · learning in public, one lab at a time