
KNOWABILITY
===========

Run the sim on the client side or on the server side and send back a replay?

Maybe a testing ground on client side with a known map?

Probably provide nothing to players but the ability to run games on the server
and get a result back.

Since the game as I envision it will have lots of stuff to discover, the
player will have to run a zillion games. Maybe that means the game should be
a client-side executable.


CONVERSING
==========

Idea: Instead of generating a log from anywhere, have an NPC who is a
biographer. When you come and TALK to him, your ALLEGIANCE text gets written
into some record. This way information gathered abroad needs to be brought
back to get to the player. This could still be done by not letting the player
see the log unless they player returns home.

Perhaps ALLEGIANCE should be a longer statement. But perhaps not. Or maybe it
should just be called "statement" or something.

Interrupt address for responses or any time a beast says anything. Set an
address in INT_R and execution goes there with PC on the stack until JUMP
(as a return).

Perhaps there should be other interrupts.


GAME-SPECIFIC INFO
==================

Various things are, or could be, game-specific. For example:

* Leveling schedule (xp for a given level)
* Spell names and effects
* Terrain types and how they work
* Victory conditions
* Equipment descriptions
* NPCs and their info

Not clear, in each case, if they should be:

* Shared as meta-info about the game
* Set in the VM special area
* Left to puzzle out empyrically
* Mentioned/described in in-game dialogues
* Fixed for all games

but the first seems best in most cases at the moment.


INFORMATION RETURNED
====================

Can you watch the whole game? Or just see the final state?

