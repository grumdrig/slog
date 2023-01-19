
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
1 Bisquit / Cisquit
1 Featherless / King Featherless
1 Multibar / Macrobar
2 Air Cucumber / Amphi Cucumber
2 Blinker / Strober
2 Quince / Squince
2 Seamole / Mole Shark
3 Swan-at-Arms / Draken-at-Arms
3 Night Smurf / Midnight Smurf
3 Bunisaur / Bountisaur
3 Landale / Amphidale
3 Chespian / Crosspian
3 Wist-o-the-Hill / Wist-o-the-Willow
4 Dust Monster / Void Monster
4 Dwoks / Dwoken
4 Objectifist / Injectifist
4 Pecadinus / Rockadinus
4 Misplacer / Relocator
4 Knolling / Knollon
4 Proboscan / Oberscan
5 Randroid / Exactoid
5 Komeek / Mokomeko
5 Gelidode / Hardode
5 Pleshy / Pot Pleshy
6 Blood Pudding / Blood Meal
6 Deddy / Grendeddy
6 Umbertine / Sepitine
6 Psinon / Onpsinon
6 Fish Lich / Paradox Lich
7 Trall / Tange
7 Sadilla / Ohmlaut
7 Timelisk / Metalisk
7 Clamerus / Clameron
7 Werewat / Huwerewat
8 Kashasa / Kashasfas
8 Munt / Moonit
8 Botherbear / Scissorbear
8 Betagorgon / Alfagorgon



### Spells

Maybe an equipment slot for a scroll. You can either read the scroll
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


### Equipment

RING

Boost stats or other factors. Just use the slot value to index its effect

Some or all might be cursed. Once you have them you can't get rid of them.

Or else have them be spells. Maybe it lets you cast them, or else gives the
effect permanently.

Maybe just get rid of these for v1.


### Combat

Stats are low, like starting 1-3. They and weapon create an attack value, armor and dex creates a defend value, add each of those to a die roll, if attacker's roll is higher than the defenders its a hit. Should be some non-zero chance of guaranteed hit. Then there's a number of dice for damage, maybe d2's.

Attack = DEX + weapon
Defend = DEX + armor
Damage = STR + weapon
Health = CON

Spell attack = INT + spell level

TODO have bows depend on dex not str


Architecture Changes
--------------------

Binary operators are taking up most of the opcodes. Should maybe have another
that works like UNARY and takes both params from the stack, but only for the
lesser-used operators.

It would seem more natural if function call argments were pushed on the stack
from last to first? Or am I thinking about this wrong right now? I guess it's
the opposite of how binary operators work. I'm doing external function calls
that way in any case.

I think I need or it would be best to have splat syntax for at least macros

	macro setName(letters*) external(66, *letters)

Instead I went with the opaque thing of a negative external call code meaning
the argument is a zero-terminated vector. However, setname should probably go.


LLVM
----

Right?

https://llvm.org/docs/WritingAnLLVMBackend.html



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

	sell(Potions, 5)

Each such action takes some amount of time, and it would behoove the player
not to waste any, as time available to save Bompton Island is limited.

The game takes place in nine acts, which are advanced by completing quests. In
the final act, the quests, as they are completed, will cause the character to
be transported to Sygnon Isle, to encounter and hopefully defeat the final
boss.



Decision Tree
-------------

In retrospect it kinda would have made more sense to do a decision tree rather
than a VM. Here's an example strategy. The ifs and elses are implied.

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

The advantage would be that hot-swapping strats is a no-brainer.

The disadvantage is that that doesn't look quite as readable to me. Also it's
not as flexible or at least not as easily flexible.


Follow-on Ideas
---------------

- Treat Chinbreak as a module. Use the resulting state vector in the next one.

- PvP or other multiplayer, wherein some game state is shared. Battle Royale, etc.

- Leaderboards



Lucas' Ideas
------------

Glass sword - super-powerful but breaks when you use it

Butter knife

Switch tomahawk? Dull rusty hatchet?

0-level weapons Burnt toast etc butter knife Snowball Branch
1 Wooden mallet

Scary armor

Trash can lid

Shield with lion head on it


Lava shark mount

Werepig

Geenome


Marble Mage end boss


Real Time
---------

Show elapsed real time (in progress-bar mode) in outputs


Cinematics
----------

Should have to call watchcinematic() several times so that there can be
transitional text.

Also have that text.

For that to work, would need a quest for the cinematic to keep track of its
progress.


Big Mobs
--------

Switch all mobs to the big versions with 1.5 HD as of act 4 or 5


More API Minimization
---------------------

- rest: seek(Health) or seek(Energy) for a lighter rest

- levelUp: seek(Level)

- seekquest: seek(QuestObject)

- completequest: seek(QuestEnd)

Not so sure about any of this.



Plot Cutscenes
--------------

Call advancePlot() until it returns 0 to advance Act. Wait this still requires
a quest to keep track of the number.

Have mobs have a minimum and maximum act where they appear.

Acts can just advance when last quest is finished.

Prologue

(You can run around before starting the plot but there's no mobs or anything.)

Parakeets twitter and squirrels chitter outside your cottage in Bompton Town.
But doesn't it seem lately that the local wildlife has been acting odd? ...Aggressive?
There's a rustling of underbrush and suddenly the town is under attack!
Squirrels! Rabbits! Parakeets! ... Wild boars! Tigers! Feral gnomes!
You flee in fear to the shore. From Sygnon Isle yonder, there's a rumble and a black cloud.
Back in town, city hall is in flames. There are many corpses... You gather a few supplies...
You vow you'll help the people of Bompton and put an end to whatever evil is afoot!

Act I

(Only wildlife type mobs are available)

(The last quest is to bring some totem to Chinbreak Cliffs and drop it.)

The shards of the Noonak Totem lie broken before you...but what glints among them?
You brush the shards aside and pick up an impressive new weapon.
Around you, as if emerging from a spell, many of the local fauna look about them adorably.
...and then attack their still-bewitched bretheren!
Suddenly, all battles cease as a thunderclap and then a moan issue from a nearby grove.
A creature more horrible than you've ever seen before appears! As it glowers, you run!

(Automatic weapon upgrade)

Act II

(QuestEnd = some woods)

You hear a crashing in the woods ahead. You creep forward to investigate.
It's the horrible beast! It scratches at something on the ground.
The beast suddenly rears and sniffs the air, then charges away noisily.
In its midden pile you discover a fine piece of armor.
Donning it, you charge off the way the beast went. It must be put an end to!

(Armor upgrade)

Act III

(Cutscene is second-to-last quest.)

*Bunch of stuff about the beast coming to Bompton Town and causing havoc.*

(End act with a boss battle with the beast.)

*Another cutscene where the isle really starts smoking. Whatever, time to clean up the rest of these beasts.*

Act IV

You've slaugtered many such beasts and were starting to run low. Don't like the looks of that island, but it doesn't seem like a problem. What's that now, the fucker is erupting! At the same time the ground is splitting open all arount. Out crawl even worse beasts, leading little beast armies. They run to the far corners of the world. Shrugging, you sharpen your bandyclef.

Act V

You fight and kill one of these new minibosses but there's plenty more of them. Surely there's a broader solution. Maybe the queen miniboss. Let's keep track of their movements.

Act VI

We killed lots of minibosses in this act but now somehow or other we're  ready to take out the queen.

(Another miniboss battle)

It must be that Isle. We've got to find a way to get there. For some reason these totems seem to be the key. Someway or other we have to find the combo.

Act VII

Find the wise man that knows how

Act VIII

Do some task that gives you the knowledge

Act IX

Move totems around, go to isle. Do a few more quests

(Main boss battle)

*Final cinematics*

Somehow the ability back to Bompton is granted. Ideally it could go both ways.

TODO
----

Generate strat files from IDE

Cutscene support

Main quests

Finish plotline

Setting breakpoint should reset and run instant style

I wonder how many to do lists there are in this project
