Slog
====

Here's the idea. Run PQ-esque characters in an RPG world based on a very
limited-length assembly code which guides their behavior. Have them start as
bare characters, then they can, if they like, train up stats or whatever
based on checking registers, running routines to see if there's monsters
about, etc.

In other words the character runs a virtual machine.



Bompton Island / Chinbreak Island module
========================================


### Towns

Different
* prices,
* quests


### Mobs

Say 12 but with different variations that make them stronger?

Naybe the buffer version have greaterlevel = ceil(lesserlevel * 1.5)

Maybe just level 1, level 2, etc. But I've got here some scarier names to sub in at higher levels


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


Maybe have spells use a tech ladder, so you gotta learn A and B to be able to
learn C, which replaces them.

Also, maybe an equipment slot for a scroll. You can either read the scroll
(cast(equip_scroll)) or study it to learn the spell. Spells might be
available in some places or something. Exchange a treasure with some guy?
Stick NPC's in each tile?

List of spells from a note on my phone:

* Susan’s Opening Salvo
* Snowmound
* Go Fuck Yourself, Janine
* Ferment
* Spectral Bampot
* Unusual Greeting
* Tacklebox
* Relevant Info
* Classic Paladin
* Overcook
* Hogtie
* Delta P



### Charawcter race

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


### Proficiency

Weapon types:
0. Clubs
1. Blades
2. Bows

Choose? Or determined by race? The latter I guess.


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

Or else have them be spells. Maybe it lets you cast them, or else gives the
effect permanently.

Maybe just get rid of these for v1.


TOTEM

One per map tile.

Just for quests I guess

Could be they boost something too though.


### Combat

Stats are low, like starting 1-3. They and weapon create an attack value, armor and dex creates a defend value, add each of those to a die roll, if attacker's roll is higher than the defenders its a hit. Should be some non-zero chance of guaranteed hit. Then there's a number of dice for damage, maybe d2's.

Attack = DEX + weapon
Defend = DEX + armor
Damage = STR + weapon
Health = CON

Spell attack = INT + spell level

TODO have bows depend on dex not str


### Predictablility

We use a predictable PRNG with a seed based on code checksum, so the game is
always exactly the same with the same binary.


Styling
-------

I just changed to XP styling. You have to

	npm install xp.css


Game Over
---------

The first state variable is required to be GameOver. The game stops running
once it's non-zero.


Architecture Changes
--------------------

Binary operators are taking up most of the opcodes. Should maybe have another
that works like UNARY and takes both params from the stack, but only for the
lesser-used operators.

It would seem more natural if function call argments were pushed on the stack
from last to first? Or am I thinking about this wrong right now? I guess it's
the opposite of how binary operators work. I'm doing external function calls
that way in any case.

Have a name for the char. Maybe even a class.

I think I need or it would be best to have splat syntax for at least macros

	macro setName(letters*) external(66, *letters)

Instead I went with the opaque thing of a negative external call code meaning
the argument is a zero-terminated vector. However, setname should probably go.

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

https://llvm.org/docs/WritingAnLLVMBackend.html


Drops
-----

Need 3 or 4 levels of drops with value scaling up.

1 Skins
10 Reagents
100 ?
1000 Treasures

Drops and resources serve kind of the same purpose, or at least have the same
value. Call them scrap? junk? chaff? forage? fodder? Not have them?

Merge forage and food? Seems like food should be more valuable if kept

Reagents should be hard to scavenge, or harder than resources.

Use food as you travel? Would need to be scavengeable. Or take twice as long
without food. Starving is no fun.

| item  | value | wt | where and what
|-------|-------|----|----------
| Drops | 1/10  |  1 | From mobs. Not useful
| Skins | 1     |  1 | From mobs. Not useful
| Food  | 10    |  1 | From mobs, stores, forage
| Reagt | 100   |  1 | Maybe from mobs, stores forage
| Treas | 1000  |  3 | From mobs
| Resou | 1/10  |  1 | Forage, not useful


Players Guide
-------------

Welcome to Progress Quest Slog.

As a player of Progress Quest Slog, you will be granted an avatar to carry out
your will in the game world. This avatar will experience a series of
adventures which culminate, ideally, in saving their home, Bompton Island,
from the nearby evil prescence which has been making things worse on the
island for some time.

You means of doing so are through giving your adventurer very explicit
instructions on how to proceed. Said adventurer is willing and loyal, and
holds much potential, but is also pendantic to a fault. They will not stray
from your instructions.

The mental state of your avatar is represented by the Slog Virtual Machine
(SVM), which processes its instructions, in the form of machine code, and
acts on them, We might call these instructions a "program".

The SVM is documented in some detail, but the player will probably not need to
know most of that. Instead the program can be produced by compiling a
higher-level language called Slog, using the slog compiler. (Of course it
would be possible to compile other languages into code suitable for the
SVM.)

The program interacts with the game code in two ways. There is a `state`
vector, which is a number of integers, which fully describes the game state
at any particular moment. For example, your character, as in most RPGs, has a
level (a general assement of overall development) that starts at one and may
climb in value as the game progresses. It's index in the state vector is
designated `Level`, and the character's current level may be accessed in a
program by prefixing the `.` operator to that index, i.e., by `.Level`.

Similarly, to give some other examples, the character's currest strength
rating is `.Strength`, and current location is `.Location`.

The other interface with the game world from within a character program is a
set of functions which are called when it's time for your charact to take
some action in the game. For example, the `travel` function is used to change
location, so this statement would move towards or into Iperko Forest:

	travel(IperkoForest)

Likewise, to sell five potions:

	sell(InventoryPotions, 5)

Each such action takes some amount of time, and it would behoove the player
not to waste any, as time available to save Bompton Island is limited.

The game takes place in nine acts, which are advanced by completing quests. In
the final act, the quests, as they are completed, will cause the character to
be transported to Sygnon Isle, to encounter and hopefully defeat the final
boss.



Stats
-----

Strength
Agility
Constitution -> Endurance
Intelligence -> Intellect
Wisdom -> Perception?
Charisma


Skins
-----

Spoils/drops becomes skins. (Could call them trophies but it sounds a little
grand.) There's a SkinMob field. When you loot skins if SkinMob matches the mob
then SkinMob is that beast, otherwise becomes 0 and the skins are generic. Then
the skins can be quest items.

In general inventory items can't be purchased and can only be gotten some
other way.

Resources or something: foraging. Or call it forage.

Not sure about other items.

Maybe you can buy reagents.

Maybe you get treasures for completing quests?


Decision Tree
-------------

In retrospect it kinda would have made more sense to do a decision tree rather
than a VM. Here's an example strategy. The "if"s are implied

.Terrain = Town
	.Health < .MaxHealth
		rest()
	.Trophies > 0
		sell(Trophies, .Trophies)
	.QuestQty = 0
		seekquest()
	travel(Wilderness)
.Health < .MaxHealth / 2
	travel(Bompton)
.QuestLocation and .QuestQty < .QuestDuration and .Location != .QuestLocation
	travel(.QuestLocation)
.MobType
	melee()
hunt()

If course I could write a decision tree compiler implemented in the VM

TODO: turn a fairly operational full strategy into a decision tree and see how
it looks.


Follow-on Ideas
---------------

- Treat Chinbreak as a module. Use the resulting state vector in the next one.

- PvP or other multiplayer, wherein some game state is shared. Battle Royale, etc.

