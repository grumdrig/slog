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

  	TALK: (results in journalled conversation?)

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


PQ6
===

Maybe the thing to start out with is something pretty close to PQ 6. Even
closer, that is, than the above. As simply as can be.

* travel(location)

Relocate to town or else the killng fields, or one of many such. Some might be good for completing quests, some might be good for gaining xp, some for training.
CON helps

* execute(): Fight the mob that's there (Ill effects if done in town!)

There's a not-too-long list of mobs and what they drop.
This causes some damage and may kill you.
STR or DEX depending on weapon

* sell(slot, qty)

Sell anything you have that's saleable. Or make them select a slot.
Maybe you get 0 for stuff if you're not at a store (so it's also drop())
CHA helps
INT helps?

qty 0 to ask price

* buy(equipment_slot, level)

Upgrade equipment
CHA helps prices
WIS helps?

0 to ask price

* seekquest()

Get yourself a quest.
Maybe it has a location you have to walk to too.
You can seek to abandon a quest.
CHA helps

* completequest()

Once progress is full, get spoils.

* study(spell)

Learn or upgrade a spell.
Different locationas are better for certain spells.
INT helps

* train(stat)

Different locations will be better for training certain stats.
DEX helps with STR and CON
INT helps with CHA and WIS

* cast(spell)

Uses energy, natch.
INT or WIS depending on spell

* bell(freq)

Plays a sound effect
CHA helps

* forage()

Look for good stuff to add to inventory
INT helps

* levelup()

CON helps HP
WIS helps MP or is it energy?

* give(slot)

Spurs along quests


### Towns

Different
* prices,
* stat training,
* spell training,
* available equipment?,
* quests
* npc species

Yar:
	0,1
	Good for training wisdom.
	Eff

Pillary:
	2,3
	Good for strength
	Hardwarf

Hohamp:
	3,0
	Good for constitution
	Hardwarf

Bompton:
	5,2
	Good for charisma
	Dunkling
	HOME

Cholar:
	0,5
	Good for intelligence
	Dunkling

Delial:
	4,4
	Good for agility
	Dunkling


### Map


	~~F!mM
	!vFmMF
	FmMMF!
	_M!m__
	v_FF!#
	!v_F_#

Key:
	Name
	Terrain
	Denizen
	Level

	+----------+----------+----------+----------+----------+----------+
	| Watha    | Maak     | Wolfin   |  Hohamp  |  Skiddo  | Chinbreak|
	|  tundra  |  tundra  |  forest  |  town    |  hill    | mountain |
	|          |          |          |  dwarf   |          |          |
	|   7      |    5     |    2     |   0      |   1      |   7      |
	+----------+----------+----------+----------+----------+----------+
	|  Yar     | Deepni   | Barkmot  | Goldona  | Breezeby |  Iperko  |
	|  town    |  forest  |  forest  |  hill    | mountain |  forest  |
	|  eff     |          |          |          |          |          |
	|   0      |   1      |    4     |   3      |   5      |   1      |
	+----------+----------+----------+----------+----------+----------+
	|  Blesh   |  Donday  | Skidge   | Krako    | Sprue    |H Bompton |
	|  forest  |  hill    | mountain | mountain |  forest  |  town    |
	|          |          |          |          |          | dunkling |
	|  2       |    3     |   5      |   4      |   2      |   0      |
	+----------+----------+----------+----------+----------+----------+
	| Terfu    | Blue Mist|  Pillary | Grein    | Woofa    | Hallon   |
	|  plain   | mountain |  town    |  hill    |  plain   |  plain   |
	|          |          |  dwarf   |          |          |          |
	|    3     |    1     |    0     |   3      |   2      |  1       |
	+----------+----------+----------+----------+----------+----------+
	| Donga    | Panar    | Owlholm  | Apapay   | Delial   | Solla    |
	|  marsh   |  plain   |  forest  |  forest  |  town    | desert   |
	|          |          |          |          | dunkling |          |
	|   1      |   2      |   4      |   3      |  0       |   1      |
	+----------+----------+----------+----------+----------+----------+
	| Cholar   | Ritoll   | Arapet   | Wheewit  | Enotor   | Noonaf   |
	|  town    |  marsh   |  plain   |  forest  |  plain   | desert   |
	| dunkling |          |          |          |          |          |
	|   0      |   4      |   6      |   5      |  4       |   5      |
	+----------+----------+----------+----------+----------+----------+

6x6 looks like it might be better if I have 6 towns

Some places might have min requirements to enter (equipment, spell, level, etc)




### Mobs (say 12 but with different variations that make them stronger?)

Naybe the buffer version have greaterlevel = ceil(lesserlevel * 1.5)

Maybe just level 1, level 2, etc. But I've got here some scarier names to sub
in at higher levels


Monster brainstorm with Andy, transformed:

1 Owlcub / Olowala
3 Bunisaur / Bountisaur
5 Randroid / Exactoid
4 Objectifist / Injectifist
3 Wist-o-the-Hill / Wist-o-the-Willow
5 Gelidode / Hardode
6 Blood Pudding / Blood Meal
4 Misplacer / Relocator
7 Trall / Tange
8 Munt / Moonit
4 Knolling / Knollon
4 Proboscan / Oberscan
7 Clamerus / Clameron
5 Pleshy / Pot Pleshy
6 Boglard / Bognivore
2 Quince / Squince
6 Deddy / Grendeddy
5 Komeek / Mokomeko
3 Swan-at-Arms / Draken-at-Arms
7 Timelisk / Metalisk
8 Betagorgon / Alfagorgon
3 Dust Monster / Void Monster
2 Noteti / Innoteti
4 Dwoks / Dwoken
6 Psinon / Onpsinon
7 Werewat / Huwerewat
3 Chespian / Crosspian
8 Kashasa / Kashasfas
1 Featherless / King Featherless
1 Multibar / Macrobar
2 Air Cucumber / Amphi Cucumber
3 Landale / Amphidale
2 Seamole / Mole Shark
1 Bisquit / Cisquit
8 Botherbear / Scissorbear
2 Blinker / Strober
3 Polycorn / Expicorn
6 Umbertine / Sepitine
7 Sadilla / Ohmlaut
3 Night Smurf / Midnight Smurf
4 Pecadinus / Rockadinus
6 Fish Lich / Paradox Lich



### Spells

	* fireball: kill a monster sans damage
	* heal: heal, just like it says
	* haste: walk faster
	* buff: make stronger or whatever temporarily
	* invisibility: it's just cool
	* luck: increase drops for a while


### Quests

* Give # of something to somewhere
* Kill # mobs
* more?


### Um...

For progress bars, pause the machine every player action, I guess.

This is starting to look a bit like the complicated original-ish idea.

For training stats and spells, maybe just have a % chance of success rather
than keeping track of progress. Less info to manage, but otoh it better to
have less randomness I think


### Charcter race

Maybe we should belong to one of the races.

Who       Values   Disdains
--------- -------- ----------
Nerflings Hardwarf Eff
Eff       Nerfling Hardwarf
Hardwarf  Eff      Nerfling

Maybe should have human too, even though no such home town. Or make Bompton human.

Maybe should allow monster races too, though it will be hard on the player.


### Character class

Might affect weapon options, some stat-learning bias, etc


### Initialization

Start at level 0. None of the external calls work except initialize() and
startGame(). Give character 8 points to assign to stats via initialize() also
set the race and class slots. Then call startGame().


### Proficiency

Weapon types:
0. Clubs
1. Blades
2. Bows

Choose? Or determined by race? The latter I guess.

Weapons numbered so that `N % 3` is the weapon type.


### Endgame

Once player reaches Act IX, the only quests he will be given is to
1. Go obtain some particular jewelry item by some means
2. Place the item on some altar or something in some spot on the map
(Or maybe three of these things.)

When the item(s) are there, they are transported an island way down on row 8:

	+----------+----------+
	| Sygnon   | Emkell   |
	|  town    | mountain |
	| ghosts   |          |
	|   0      |   9      |
	+----------+----------+

where they can get quests to fight some adversaries (minions of the final
boss), and finally fight the boss. Resources in the final island are limited and/or expensive, and there's no returning.


### Equipment

RING

boost stats or other factors. Just use the slot value to index its effect


TOTEM

just for quests I guess


### Combat

Not sure if should do combat round-by-round or abstract to the full fight. The
former is probably easier.

Stats are low, like starting 1-3. They and weapon create an attack value, armor and dex creates a defend value, add each of those to a die roll, if attacker's roll is higher than the defenders its a hit. Should be some non-zero chance of guaranteed hit. Then there's a number of dice for damage, maybe d2's.

Attack = DEX + weapon
Defend = DEX + armor
Damage = STR + weapon
Health = CON

Spell attack = INT + spell level


### Predictablility

Use a predictable PRNG with a seed based on code checksum, so the game is
always exactly the same with the same binary.


Styling
-------

I just changed to XP styling. You have to

	npm install xp.css


Game Over
---------

The first state variable is required to be GAME_OVER. The game stops running
once it's non-zero.


Architecture Changes
--------------------

Should probably change to one opcode for externals, with the operand giving
operation code. They then pass floor(operand/100) additional parameters off
the stack.

Binary operators are taking up most of the opcodes. Should maybe have another
that works like UNARY and takes both params from the stack, but only for the
lesser-used operators.

And with that, can get under 32 ops and have 11-bit immediates.

Output a symbol table for the debugger

Change 'var' to 'let'?


Backstory
=========

Life on Bompton had been generally peaceful for as long as anyone there could
remember, with Hardwarf and Eff, Dunkling and Human, living in relative
harmony. But in the year 526, dangerous monsters of all different sorts began
to appear around the island, causing no head of mayhem to travellers and
homesteaders alike.

Some supposed that this alarming change could be related to the goings on
observed at nearby Grayhame Isle, where odd plumes, eerie noises, and flashes
of light were all noted by those who dwelled on the coast opposite it, along
with noxious odors carried on winds from that direction.  The fact is that
such speculation was correct. An evil presence had taken up residence high on
Mt Emkell on Grayhame Isle, and was practicing such magics as to cook up
trouble on Bompton.

Unfortunately, time was very limited for the Bomptonites. As the evil one's
power grew, so did the suffering of the once happy people.

But one hero, little more than a child, would prove to be the only hope for
the dwellers on Bompton. Would this person be able to build their power,
training and studying, enough to defeat this threat? That's up to you to
prove!

