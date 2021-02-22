# gh-illumos-builder

### About

This is clearly taken from [freebsd-builder]. The goal is to build a similar
system that is capable of running illumos workloads via vbox on macOS.

[freebsd-builder]: https://github.com/vmactions/freebsd-builder

This image is based on an omnios build that contains a modified version of the
illumos metadata-agent that supports VirtualBox. The actual workflow action
will be responsible for seeding the VM with a cpio disk image that sets up
things like nodename, networking, and ssh keys.
