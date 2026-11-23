# Device lab run nightly-20261123

## intake - https://automate-and-improve.github.io/?notrack

| Platform | Result | Screenshots |
|---|---|---|
| Windows Edge | ok (13/13) | 3 |
| Windows Chrome | ok (13/13) | 3 |
| Windows Firefox | ok (13/13) | 3 |
| Windows Chrome, phone size | ok (13/13) | 3 |
| macOS Safari | ok (13/13) | 3 |
| macOS WebKit as iPhone (interactive) | ok (13/13) | 3 |
| iPhone simulator (Mobile Safari) - iPhone 16 iOS-26-2 | ok (0/0) | 1 |
| Android emulator (Chrome) | **1 failed** (0/1) | 0 |
- Android emulator (Chrome) · start · emulator booted: kvm: crw-rw-rw- 1 root kvm 10, 232 Nov 23 15:08 /dev/kvm / 15:08:34 downloading system image / 15:09:06 download exit 0 / KVM (version 12) is installed and usable. / 15:09:07 phones: lab  / 15:09:07 emulator started / 15:11:07 device visible: exit 0 / 15:16:08 booted=0
- note (iPhone simulator (Mobile Safari) - iPhone 16 iOS-26-2): screenshot only: Mobile Safari in the simulator can be looked at, not steered
- note (iPhone simulator (Mobile Safari) - iPhone 16 iOS-26-2): Apple's driver could not steer the simulator (session not created: Could not create a session: The session timed out while connecting to a Safari instance. The following asynchronous operation timed out: Fi): screenshot only
