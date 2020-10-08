; zero page
lda #$01
sta $10

; zero page x
ldx #$01
sta $10,x

; absolute
sta $0012

;absolute x
sta $0012,x

;absolute y
ldy #$01
sta $0013,y

;indexed indirect x
ldx #$15
stx $30
ldx #$00
stx $31
ldx #$01
sta ($2f,x) ; $2f + x = $30 -> $0015

;indirect indexed y
ldy #$01
sta ($30),y ; $30 -> $0015 + y = $0016

debg $0010 ; 01 01 01 01 01 01 01 00
