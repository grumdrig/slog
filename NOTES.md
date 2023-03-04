Developer Notes
===============

Nothing to see here. Move along.


### Mobs

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

List of some spell names from a note on my phone:

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



### Character race

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

Missing language feature: continue statement

Missing language feature: static local variables


LLVM
----

Right?

https://llvm.org/docs/WritingAnLLVMBackend.html



Players Guide
-------------

Welcome to Progress Quest Slog.

As a player of Progress Quest Slog, you will be granted an avatar to carry out
your will in the game world. This avatar will experience a series of
adventures which culminate, ideally, in saving their home, Chinbreak Island,
from the nearby evil prescence which has been making things worse on the
island for some time.

You means of doing so are through giving your adventurer very explicit
instructions on how to proceed. Said adventurer is willing and loyal, and
holds much potential, but is also pendantic to a fault. They will not stray
from your instructions.

The mental state of your avatar is represented by the Slog Virtual Machine
(SVM), which processes its instructions, in the form of machine code, and
acts on them. We might call these instructions a "program".

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

Similarly, to give some other examples, the character's current strength
rating is `.Strength`, and current location is `.Location`.

The other interface with the game world from within a character program is a
set of functions which are called when it's time for your charact to take
some action in the game. For example, the `travel` function is used to change
location, so this statement would move towards or into Iperko Forest:

	travel(Iperko_Forest)

Likewise, to sell five potions:

	sell(Potions, 5)

Each such action takes some amount of time, and it would behoove the player
not to waste any, as time available to save Chinbreak Island is limited.

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

- Dungeon crawl



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


More API Minimization
---------------------

- rest: seek(Health) or seek(Energy) for a lighter rest

- levelUp: seek(Level)

- seekquest: seek(QuestObject)

- completequest: seek(QuestEnd)

Not so sure about any of this.



TODO
----

Finish plotline

Have quest mob levels closely follow act, so maybe 1,2,3 as act 1 progresses,
then 4,5,6, in act II, or whatever. Something like that.

Test hash function

Make all handleInstruction error returns unique and labelable

Make XP needed be incremental so we can fit in more levels?

Play balance is terrible. After level 1 pretty sure all battles are very easy.

Decide how new game seeds should be defined. Randomly when playing the game?

Figure out whether to
1) start off with training points, or
2) pick starting stats in the strat, or
3) pick starting stats in the create screen (favoring this idea)
4) or even just start with really low stats


Math time
---------

Kill N mobs level L quest XP =
	killing xp
		N * xp(moblevel) =
		N * moblevel ~=
		N * questlevel ~=
		N * L
	+ quest xp ~=
		5 * L
                        0  1  2  3  4  5  6   7   8   9
~= if N == 10: 15 * L = 0 15 30 45 60 75 90 105 120 135

q/level if L = level

 0  1  2  3  4  5  6   7   8   9
 0  0  1  2


Hopper
------

Notes on redesign of how items come & go. Not sure that it's a keeper.

AvailableItem
AvailableQty
AvailableGold / Till / Consideration / Balance / Payment

To sell something:

	offer(item, qty) Dropping N Xs / Offering up N Xs
	take(Payment)    Completing the sale of N Xs

To buy something

	inquire(items, qty)     Asking about X
	offer(Gold, -.Payment)  Digging around in your pocketbook // or do this automatically?
	take(AvailableItem)     Obtaining X // or Completing purchase of X

To forage

	forage()  Rooting around for forageable items (clear corpse)
	take(AvailableItem)   Picking up an X

To loot

	( use(Weapon) )
	take(MobSpecies)   Taking proof of kill from the X's remains
	  or
	take(AvailableItem)  Looting a X from the X's corpse

or maybe when you kill something the Availables update if there's something special but you can always take(Trophy) if there's a dead body


	offer: { parameters: 'slot,qty',
		description: `Offer a quantity of an item or piece of equipment for
		sale. The item and it's quantity or quality will appear in the
		AvailableItem and AvailableQty slots; the offered price will
		appear in the Payment slot. However, if slog is Gold, then the
		stated quantity of Gold will be removed from inventory and added
		to Payment.`, };

	inquire: { parameters: 'slot,qty',
		description: `Request to purchase a quantity of items or quality of an
		equipment piece. If available for purchase, the item and its
		quantity or quality will appear in the AvailableItem and AvailableQty
		slots. The purchase price with appear as a negative value in the
		Payment slot.`, },

	take: {  parameter: 'slot',
		description: `Remove the indicated item and add it to inventory or
		equipment. The slot may be 1) AvailableItem to take or purchase a
		found or market item (in which case the value of Payment must be
		at least zero), 2) Payment to complete a sale, or 3) MobSpecies to
		loot a body for trophies (in which case MobHealth must be zero).`, },


I'm starting to think this is a good idea iff there's a step where you seek
(Merchant) or seek(Banker) first.


Item Collection best practices
------------------------------

Assigned as normal Collect_Item quest:

- Gold: kill weak mobs, collect trophies, sell them
- Trophies: kill weak mobs, collect trophies
- Ammunition: forage
- Rations: forage but do not eat them all

Assigned by game script:

- Elixirs: buy? there should perhaps be a better way

Why not assigned by quests?

-  Reagents: forage? buy?

Not assigned by quests

- Treasures: buy?
- Potions: buy?
