# Device lab run nightly-20261106

## intake - https://automate-and-improve.github.io/?notrack

| Platform | Result | Screenshots |
|---|---|---|
| Windows Edge | ok (13/13) | 3 |
| Windows Chrome | ok (13/13) | 3 |
| Windows Firefox | ok (13/13) | 3 |
| Windows Chrome, phone size | ok (13/13) | 3 |
| macOS Safari | ok (13/13) | 3 |
| macOS WebKit as iPhone (interactive) | ok (13/13) | 3 |
| iPhone simulator (Mobile Safari) - iPhone 16 iOS-26-2 | **1 failed** (0/1) | 1 |
| Android emulator (Chrome) | **1 failed** (0/1) | 0 |
- iPhone simulator (Mobile Safari) - iPhone 16 iOS-26-2 · start · platform started and page opened: Command failed: xcrun simctl openurl 309F4F0C-F632-4F5C-BB25-BD783E57455C "https://automate-and-improve.github.io/?notrack"
An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=60):
Simulator device failed to open https://automate-and-improve.github.io/?notrack.
Operation
- Android emulator (Chrome) · start · emulator booted: kvm: crw-rw-rw- 1 root kvm 10, 232 Nov  6 12:21 /dev/kvm / 12:21:10 downloading system image / 12:21:51 download exit 0 / KVM (version 12) is installed and usable. / 12:21:52 phones: lab  / 12:21:52 emulator started / 12:23:52 device visible: exit 0 / 12:28:53 booted=0
- note (iPhone simulator (Mobile Safari) - iPhone 16 iOS-26-2): Apple's driver could not steer the simulator (session not created: Could not create a session: The session timed out while connecting to a Safari instance. The following asynchronous operation timed out: Fi): screenshot only
