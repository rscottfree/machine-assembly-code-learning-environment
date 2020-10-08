; zero page
ldy #$03
sty $10

; zero page x
ldx #$01
sty $10,x

; absolute
ldy #$04
sty $0012

debg $0010 ; 03 03 04
