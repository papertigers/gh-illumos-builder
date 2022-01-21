const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const fs = require("fs");
const path = require("path");


async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function vboxmanage(vmName, cmd, args = "") {
  await exec.exec("sudo  vboxmanage " + cmd + "   " + vmName + "   " + args);
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    let sshport = 2222;

    core.info("Install qemu");
    await exec.exec("brew install qemu");

    let imgName = "omnios-r151038";
    // change to illumos.org
    let url = "http://lightsandshapes.com/" + imgName + ".raw.xz";
    core.info("Downloading image: " + url);
    let img = await tc.downloadTool(url);
    core.info("Downloaded file: " + img);
    let raw = imgName + ".raw";
    await io.mv(img, "./" + raw + ".xz");
    await exec.exec("xz -d -T 0 --verbose " + raw + ".xz");

    let vdi = imgName + ".vdi"
    await exec.exec("qemu-img convert -f raw -O vdi " + raw + " " + vdi);

    let vmName = "omnios";
    core.info("Create VM");
    await exec.exec("sudo vboxmanage  createvm  --name " + vmName + " --ostype Solaris11_64 --default --basefolder omnios --register");

    // XXX already exists when using Solaris11_64 ?
    //await vboxmanage(vmName, "storagectl", " --name SATA --add sata  --controller IntelAHCI ")

    await vboxmanage(vmName, "storageattach", " --storagectl SATA --port 0  --device 0  --type hdd --medium " + vdi);

    await vboxmanage(vmName, "modifyvm ", " --vrde on  --vrdeport 33389");

    await vboxmanage(vmName, "modifyvm ", " --natpf1 'guestssh,tcp,," + sshport + ",,22'");

    await vboxmanage("", "modifyhd ", vdi + " --resize  100000");

    let ova = imgName + ".ova";
    core.info("Export " + ova);
    await vboxmanage(vmName, "export", "--output " + ova);
    await exec.exec("sudo chmod", ["666", ova]);

    core.info("Compress " + vdi);
    await exec.exec("7z", ["a", imgName + ".7z", ova]);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
