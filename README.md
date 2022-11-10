PQASM
=====

Or CHASM.

Here's the idea. Run PQ-esque characters in an RPG world based on a very
limited-length assembly code which guides their behavior. Have them start as
bare characters, then they can, if they like, train up stats or whatever
based on checking registers, running routines to see if there's monsters
about, etc.

In other words the character runs a virtual machine.


Names For Everything
====================

I've named the game Bompton Island but maybe Chinbreak Island is better?

I guess the high level language is called Slog?





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



### Mobs

Say 12 but with different variations that make them stronger?

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
	* Heal Yeah: heal, just like it says
	* haste: walk faster
	* buff: make stronger or whatever temporarily
	* invisibility: it's just cool
	* luck: increase drops for a while

Spells should maybe be crazy, like turn gold into HP. Hard to think of crazy
stuff within this universe

* Become the species of the nearby mob
* Double your money
* Scramble the map
* Create a ghost city where you stand
* Go back to year 0

Maybe have spells use a tech ladder, so you gotta learn A and B to be able to
learn C, which replaces them.

Also, maybe an equipment slot for a scroll. You can either read the scroll
(cast(equip_scroll)) or study it to learn the spell. Spells might be
available in some places or something. Exchange a treasure with some guy?
Stick NPC's in each tile?

Switch spells back to a list, then put the spell ID in each slot. If spells
have levels, put that in the MSB, but maybe just have separate spells for
higher levels.

There's no point in having %-learnedness for spells and training. Just have it
take as long as it takes.


### Quests

* Give # of something to somewhere
* Kill # mobs
* more?


### Um...

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

Change Eff to Eel Man or Eelman?


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

Boost stats or other factors. Just use the slot value to index its effect

Some or all might be cursed. Once you have them you can't get rid of them.


TOTEM

One per map tile.

Just for quests I guess

Could be they boost something too though.


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

We use a predictable PRNG with a seed based on code checksum, so the game is
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

Binary operators are taking up most of the opcodes. Should maybe have another
that works like UNARY and takes both params from the stack, but only for the
lesser-used operators.

Output a symbol table for the debugger

Change 'var' to 'let'?

It would seem more natural if function call argments were pushed on the stack
from last to first? Or am I thinking about this wrong right now? I guess it's
the opposite of how binary operators work. I'm doing external function calls
that way in any case.

Have a name for the char. Maybe even a class.

I think I need or it would be best to have splat syntax for at least macros

	macro setName(letters*) external(66, *letters)

Check tag


Tag
---

Append a tag to the binary, to identify the binary, to help watch for
endianness issues and to provide an identifier for what game the program is
for:

	{
		'Np': Int16
		version: Int16 // 0xMMmm = MAJOR minor
	}

That requires a compiler statement like

	header('Np', $0101)

No i guess in ASM it could just be

	.data 'Np' 0x0101


Local declarations
------------------

I think I've got to think about namespaces separately from scope. Scope is
only at the global (or static) level and the function level. And I'm not
nesting functions here.

Namespace is within a code block.

Globals/statics have to (reasonably) be emitted before, or after, any and all
of the code is. (Before, they're easier to see in the debugger. After would
avoid the JMP.)

In any case it seems like we need two passes. Then there needs to be records of storage needs at the module and function scopes, and a symbol table within any scope.

Here's the variable allocation situations:

- in the global context

	var x = 5

	context.symbols gets name: { static, label=x }

	context.allocations gets label=x : { count, initializer }

- inside of a code block outside any function

	while (true) { var x = 5 ... }

	global_context.allocation gets: unique(x): { count, initializer }

	local_context.symbols gets x { static, label=unique(x) }

	code gets x = 5 at the top of the loop

- as a function parameter

	func x(a) { ... }

	local_context.symbols get x: { local, offset }

- top-level in a function

	func ... {
		var x = 5

	code makes room at FP with a .stack 5

	local_context.symbols gets x: { local, offset }

- inside a block inside a function

	func ... { while ... { var x = 5 ... } }

	code makes room at FP with dec SP

	local_context.symbols gets x: { local, offset }

- static inside a function (not implemented yet)

	func ... { static x = 5 }

	local symbols get x: { static, label }

	global allocations gets unique(x): { count initializer }

- as a macro parameter

	local gets alias to expr

- top level in a macro

	global allocation gets unique(x): { count, identifier }

	local symbols gets name: { static, unique(x)


- inside a block inside a macro

	same as top level in macro

	but code gets initialization


Symbol table members
--------------------

- Alias

{ alias: true, value: Expr }

- Static allocation

{ static: true }

- Local allocation

{ local: true, offset: distance from FP }

- Function

{ function: FunctionDefinition }


LLVM
----

Right?
