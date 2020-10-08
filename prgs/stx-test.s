; zero page
ldx #$02
stx $10

; zero page y
ldy #$01
stx $10,y

; absolute
ldx #$03
stx $0012

debg $0010 ; 02 02 03
