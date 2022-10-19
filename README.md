PQASM
=====

Or CHASM.

Here's the idea. Run PQ-esque characters in an RPG world based on a very
limited-length assembly code which guides their behavior. Have them start as
bare characters, then they can, if they like, train up stats or whatever
based on checking registers, running routines to see if there's monsters
about, etc.

In other words the character runs a virtual machine.

Could also be done in some more user-friendly scripting language. But instead
maybe let someome write a compiler if they like.


Pseudo-code default
===================

	While str < 15:
		goto weight-train

	LOAD [GYM-LAT]
	LOAD [GYM-LONG]
	GOSUB gothere

	GOTHERE: ... lat long => ... (but now youre there)
	dup2
	atan2
	face
	G1:
	dup2
	push LATITUDE
	stat
	push LONGITUDE
	stat
	push DISTANCE
	gosub
	push 1
	sub
	push 0
	max
	push CLOSEENOUGH:
	branch
	walk
	push G1
	GOTO
	CLOSEENOUGH:
	POP
	POP
	GOTO (return)


	// Assume, say, town is at 0,0

	raid:

	Face east
	While longitude < char.level:
	  Walk

	While health > 2:
	  Scan for monster
	  If found:
	    Estimate monster level
	    If not too high:
	      While monster alive:
	        Attack
	      while scan for loot = find
	        Gather

	Face atan2 lat,long
	While char.distanceTo(0, 0) > 1:
	  walk

	Walk to inn/hospital somehow (maybe have a place to store markers?)
	While health < healthmax:
	  Heal

	Walk to store somehow
	while inventory.junk > 0:
	  sell

	goto raid


Architecture
============

Probably stack machine is wisest

16 bit signed everything

Mem size no more than 0x7fff = 32767 but probably much less

Instuctions might look like 0xIINN where II is the machine code for the
instruction and NN is a [signed?] number for immediate mode addressing

If NN is 0 then the number is popped from the stack (stack addressing mode)

Or probably better, if NN is -1 then it's popped

Registers are PC (program counter) and SP (stack pointer) which could also
have memory addresses

Maybe another register PP which is the last value removed from the stack

Instructions
============

When a number is given after the instruction mnemonic, that means immediate mode - the

	PUSH N: push a value on the stack
	... => ... N
	obv is this does nothing if stack addressing mode

	POP: remove a value from the stack

	STAT: push value of popped stat, also other numerical state of character
	... N => ... character.stat[N]
	OR just fetch (and occasionally set) values at a particular mem location, possibly

	FETCH: fetch value at memory location (perhaps this is just an absolute stack location)
	... N => ... MEMORY[N]
	may need other address modes

	STORE: store value in memory
	... X N => ... ; now MEMORY[N] = X

	GOTO: move program execution
	... X => ... ; PC = X
	same as STORE [PC] I guess

	GOSUB: jump to subroutines
	... X => ... PC ; now PC = X
	(RETURN is just a GOTO, thus)

	BRANCH: maybe jump
	... V X => ... ; now PC = X provided V is nonzero

	BURY N: rotate the stack N deep
	... X1 ... XN N => ... XN X1 ... X(N-1)
	or for negative number -N
	... X1 ... XN -N => ... X2 ... XN X1


Math:

	MAX: maximum
	... X Y => max(X,Y)
	(You can use this with 0 to test for postive)

	MIN: minimum
	(similarly)

	NOT: not
	... X => (0 if X != 0, else 1)

	NEG: negate
	... X => ... -X

	ADD, SUB, MUL, DIV: aritmetic operators, like you think

	ATAN2, SIN, LOG, maybe others: more math ops


Physical world:

	WALK: proceed in direction you're facing
	argument: speed as percentage(?)

	FACE: face a particular angle
	argument: angle in degrees
	... A => ...

	ACT: do the action appropriate to the current location
	(no effect on stack) or use immediate mode to indicate action. (Buy, sell, kill, etc)
	buy
	sell
	attack
	observe / hunt
	rest (works much better at healing places)
	forage

	CAST N: cast a spell
	  fly
	  dig
	  fireball
	  heal
	  haste
	  talk (results in journalled conversation?)

	JOURNAL N: add character to journal of limited length



MEM LOCATION
============

Many of these will be read-only. Seems like I should just use negative values
as mem locations starting at -1.

	PC
	SP
	PP
	Clock (age of character, capped at 32k I guess = death)
	Level
	STR CON DEX WIS INT CHA
	HP MaxHP MP MaxMP
	Encumbrance, MaxEnc
	Inventory info somehow, say, a specific slot for each type, giving qty of that
		Gold
		Reagents
		Drops
		health potions
	Equipment (multiple slots)
	spellbook (slot for each possible spell, level given)
	Latitude Longitude Depth Facing
	Allegiance (multiple characters)
	Noise volume / Noise frequency (plays tones)
	observed info:
	  general terrain (eg forest)
	  localized specific terrain (eg tree)
	  mob estimated level
	  mob estimated health
	  mob hostility
	  mob job (for npcs)
	  loot / resource nearby
	Allow journalling?




MAP
===

I'm thinking have a fixed world map with specific stuff at specific places 256^2 probably enough

Could have a underworld layer(s)

If tiled, no bigger than 32K square of course

High mountains block progress

Deep waters cause you to drown



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

