lda #$45
sta $ffff
lda #$a2
sta $fffe
debg $fff8

ldx #$00
[loop]
inx
cpx #$20
debg
debg $01f8
bnej [loop]
brk
[interrupt] ;$4595
ldy #$01
rti
