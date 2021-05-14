---
tags:
  - posts
  - tech
  - meta
date: 2021-05-12
title: Chia Network Plotting & Farming
description: Chia Network is a newer blockchain and smart transaction platform that aims to be greener, more efficient, and more secure than Bitcoin and Ethereum. It is founded by Brahm Cohen, the inventor of the BitTorrent network.
---
[Chia Network](https://www.chia.net/) is a newer blockchain and smart transaction platform that aims to be greener, more efficient, and more secure than Bitcoin and Ethereum. It is founded by Brahm Cohen, the inventor of the BitTorrent network. The project is still young - mainnet launched just seven weeks ago on March 19, 2021. Instead of using specialized hardware to "mine" as in Bitcoin or Ethereum, excess storage space is put to work to "farm". In this post I'll share some of my thoughts since I started farming Chia.<!-- excerpt -->
#### How is Chia different?
Bitcoin and Ethereum use a consensus mechanism called Proof of Work (PoW) while Chia uses Proof of Space and Time, which basically means it utilizes excess storage space rather than specialized hardware like GPUs or ASICs. I won't get too into the details of explaining Chia - they do a fine job of it on their [FAQ](https://www.chia.net/faq/) and [Green Paper](https://www.chia.net/greenpaper/).

#### The Basics
There are two main components to farming Chia - plotting and farming. Plotting is the act of creating plots which are files that are harvested when farming. Again, I won't get into the details since you can read about those on Chia's website if you're interested. Basically plots take time + resources to create, and more plots equals more opportunities to win a block and thus earn the block reward of 2 [XCH](https://www.coingecko.com/en/coins/chia).

Farming is simply the act of listening to challenges broadcast by the blockchain and checking the plots for a solution, thus farming is extremely light on energy consumption. You can easily farm using a Raspberry Pi.

#### My Setup
I've adapted my gaming PC to plot more efficiently, and am using external drives to hold the plots. My plotting/gaming PC's specs are:

* **CPU**: AMD Ryzen 7 3700X 8C16T
* **Boot Drive**: Samsung 970 EVO PLUS M.2 1TB
* **Plot Drive**: Intel S4610 960GB Enterprise SSD
* **Farm Drives**: Assorted externals totaling ~20TB
* **Memory**: G.SKILL Ripjaws V 2x16GB
* **PSU**: EVGA SuperNOVA 850 G+
* **GPU**: Radeon RX 580 (Not relevant for Chia)

#### Performance
Plotting under Windows 10 as I'm doing suffers ~10% slower plotting times. Still, with this rig I can get about four plots running in parallel staggering them at about 360 minutes (6 hours). With this offset strategy, I can pump out about 2 plots every six hours or so with two queues plotting onto the Intel S4610 SSD. I've found 4GB of RAM and 3 CPU threads per plot works well enough for now with this setup.

#### Future Improvements

##### Storage
I've just ordered a new 1TB SSD which will replace the M.2 drive as my boot drive. I'll dual boot Windows/Ubuntu on the SSD and start plotting to the M.2. The Samsung 970 EVO doesn't have the highest endurance however so it will eventually fail. Until then I should be able to almost double my plot output.

##### Raspberry Pi Farm
I have a Raspberry Pi 4 ready to be set up as a dedicated farmer. This will lower power consumption as I won't have to run my PC full time once plots are completed. The RPi 4 has four USB ports, so I'll be able to connect at least 4 external drives to it as farm storage, but may also boost that number with USB splitters.

##### Linux
As mentioned, Windows is slower to plot than Linux/MacOS, so I'll be installing Ubuntu on a partition and plotting there. I've not done much scientific benchmarking, but once I cut over to Linux I'll likely set up some more monitoring around things to better understand what is working and what isn't.

##### Staging Drive
Because the farm drives are slow spinning disks, transferring plots to them is slow. Each plot is 108.8GB so takes 20+ minutes just to transfer the plot once it's done being created on the plot drive. To unblock the plot drives, I plan to install a cheap SSD where plots will be copied to once they're complete. Then I'll set up a job to move them from staging to their final destination on the slow farm drives.

#### Return on Investment
Some people are investing tens of thousands of dollars in their plotting rigs. Who knows - maybe they will recoup that cost. I already had the gaming PC, so the only investment I made was two drives - an enterprise SSD for plotting and a 14TB external for farming. This amounts to ~$400 total which I have already made back after three weeks of farming. Of couse, not every farmer is as lucky. People on Reddit are regularly posting pictures of their several hundred plot farms where they haven't won a single block. I am hesitant to invest too deeply, so for now I will just keep plotting with what I have.

#### Random Thoughts
It's been a fun experiment playing with Chia. I've never mined a cryptocurrency before, and this one appealed to me because I didn't need any specialized hardware. Any hardware I decide to purchase for farming Chia in the future can easily be repurposed for other things should I decide to stop farming. More storage is always handy.

Chia's also pushed me into the [Homelab subreddit](https://www.reddit.com/r/homelab/) which is super interesting and has me considering a home server for running Docker and other services in my own cloud.

More to come another day :)
