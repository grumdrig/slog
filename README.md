Slog
====

Backronym: Strategic Logic Operator for Games

Slog is a general purpose platform for embedding a player-created or
player-selected strategy into an idle game. The player's avatar operates a
virtual machine which controls it's actions via game-defined callbacks; its
knowledge of the game environment is captured in a state vector.

The design of the VM is simple and asserts limits on strategies. The only data
type is signed 16-bit integers (or vectors of them). Memory size is limited
as determined by the embedding game.

Currently the game implmented for use with Slog (and it's raison d'etre) is
Progress Quest Slog: Chinbreak Island, and there may never be any other.


Documentation
-------------

Supporting documentation, and indeed the game itself, are to be found at
http://slog.progressquest.com/.


Install
-------

We use XP.css styling. You need to:

	npm install xp.css


IDE
---

Strategies can develped and tested in the primitive web-based IDE, which will
be somewhere like http://slog.progressquest.com/ide.html


Command-line Tools
------------------

Alternatively, there are command line tools:

- compile.js: Compiles Slog sources into strategies, and other byproducts

- vm.js: Assemble Slog assembly, and/or run strategies in games

Pass '--help' to these tools for usage information.


These, and all the code, are located at https://github.com/grumdrig/slog.


Supporting files, and tests, are generated with the build tool Loopy. Install
and run `loo.py` to generate everything needed.

https://github.com/grumdrig/loopy

Or run a few commands implied by what's listed in `Loopfile`.
