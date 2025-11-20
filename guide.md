Strategy Author's Guide
=======================


Documentation strings
---------------------

Some special comments in your strategy source can provide documentation for
players who may wish to use your strategy. They consist of a line comment beginning with `///` followed by one of several tags, a colon, and then some text.

The valid tags are:

- Title: A short name for your strategy

- Author: Use this to take credit for your work

- Description: A description of the strategy and the philosophy driving it

Here is an example of a full suite of documentation for a Slog source:

	/// Title: Just Dive In
	/// Author: Leeroy Jenkins
	/// Description: Attack without adequately preparing


Exports
-------

By exporting variables you will make is possible for game players to customize
their use of your strategy. Only global variables may be exported in this way.

The exported variable can (and should) be accompanied by a text string that
describes the input. In the case of the Chinbreak Island game, it can take
the form of a variable type and verbal description, separated by a colon. For
example:

	export "bool : Shoot first, ask questions later"
	var Haphazard_behavior

Since, in this case, the type is given as `bool`, the variable is presented as
a checkbox and the variable will by initialized by a 0 if unchecked, and a 1
if checked.

Other valid export types are:

`enum opt1 opt2 ...`
: Presents a set of options to select from. The variable takes on the value of the 0-based index of the selected option.

`range min to max`
: Presents a slider ranging from `min` to `max`

If no type is given, a (numeric) text box is presented to the user. The
variable name (with underscores replaced by spaces) is used as the label for
the setting. If descriptive text is provided, it appears as a tooltip if the
player hovers the mouse over the setting.

Further examples:

	export "enum Bunny Horse Dragon : Favorite animal to do battle with"
	var Favorite_opponent

	export "range 0 to 100"
	var Percent_safety_margin = 50

	export var Random_number_seed = 400

