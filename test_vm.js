let { VirtualMachine, World, Assembler } = require('./vm');
// let World = require('./vm').World;
console.log('lkjd', VirtualMachine, World);

let world = new World(`
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWW~~~~~~~~WWWWWW
WWWWWWWWWWWWWWW~~~~~F~~~~~~~WWWW
WWWWWWWWWWWWWWW~FFFFFTTTTTTTTwWW
WWWWWWWWWWWWWWFFFF!FTTTTTTTTTwwW
WWWWWWWwWWWWWWWFFFFFvvTTTTTTTwwW
WWWWWm_wWWww______FFvvvvvv_TTwwW
WWWW_m_wwww__________==vv__TTwwW
WWW_mmmwwww_________==vvvvv_wwWW
WW_mmm_wwww________==_v__W_WwwWW
WW_MMm_wWWw______===__Mm____wwwW
WWmMmm_wWW.___=^==TT_MMm___.wwwW
WWmmm__wWW.__==TTTTTmM@mm_..wwwW
WW_____wWW._==TTTTTmm!@Mm_..wwwW
WW__!_fwWW===!!__T_mMM@Mmm..wwwW
WW___ffwWW.__!!___mMM@MMmm_wwwwW
WWw_fffWWW_______mMM@Mmmm_wwwwwW
WWw_fffWWW______mmM@MMm___wwWWwW
WWwwwfWWWWW_____mMMMMmmT_wwWWWWW
WWWWwwWWWW_______MMmmmTTTTwWWWWW
WWWWWWWWWW_____#___TTTTTTTwwWWWW
WWWWWWWwW___####___TTTTTTTTwWWWW
WWWWWWww___!##_______TTTTTwwWWWW
WWWWWWw######______WWWWTTT_wWWWW
WWWWWww######_WWWWWWWWWWww_wwWWW
WWWWWw######WWWWWWWWWWWWWw_wwWWW
WWWWww##WWWWWWWWWw__mWWWWwwwwWWW
WWWWwwWWWWWWWWWWww_!mwWWWWWWwWWW
WWWWwWWWWWWWWWWWw____wwWWWWWWWWW
WWWWwWWWWWWWWWwwwwwwwwwwWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
`);



let a = new Assembler();
a.assemble(`

.macro pop
  adjust -1
.end

.macro fun one
  push one
  pop
  push
  pop
.end

fun 4
jump test

.data "Hello!"

test:

push 2
assert 2
push 3
assert 3
add ; 5
assert 5
add 3 ; 8
assert 8
sub 1 ; 7
assert 7
mul 3 ; 21
assert 21
shift 1 ; 10
assert 10
or 1 ; 11
assert 11
or 0x2 ; 11
assert 11
shift 1 ; 5
assert 5
fetch AUX ; 5 1
assert 1
add ; 6
assert 6
peek 0 ; 6 6
assert 6
sub 6 ; 6 0
assert 0
branch err ; 6
div 2 ; 3
assert 3
shift -1 ; 6
assert 6
halt 1

err:
halt 66
`);
console.log(a.disassemble());
console.log('PC', a.pc);
let vm = new VirtualMachine(a.code, world);
vm.run();
console.log(vm.aux, vm.pc, vm.alive());
// a.code.push(3);

/*
console.log('levelling');
let last = 0;
for (let l = 1; l <= 50; ++l) {
  let xp = 0 + Math.floor(Math.pow(l-1, 1.6)) * 200
  console.log(l, xp, xp-last);
  last = xp;
}
*/