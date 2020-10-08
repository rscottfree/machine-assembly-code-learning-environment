; immediate
lda #%00000111
and #%00000101
ldy #$00
debg
.debug A=05

; zero page
lda #%00000011
sta $0010
lda #%00000001
and $10
ldy #$01
debg
.debug A=01
debg $0010
.debug $0010=03

; zero page X
ldx #$01
lda #%00000011
sta $0011
lda #%00000001
and $10,x
ldy #$02
debg
.debug A=01
debg $0011
.debug $0011=03

; absolute
lda #%00000011
sta $0100
lda #%00000001
and $0100
ldy #$03
debg
.debug A=01

; absolute X
ldx #$02
lda #%00000011
sta $0111
lda #%00000001
and $010f,x
ldy #$04
debg
.debug A=01
debg $0111
.debug $0111=03

; indexed indiret X
lda #$00
sta $0011
lda #$01
sta $0012
; 0011 00 01 ; -> $0100

lda #%00000001
sta $0100

lda #%00000011
ldx #$01
and ($10,x)
ldy #$05
debg
.debug A=01

; indirect indexed Y
lda #$00
sta $0011
lda #$01
sta $0012
; 0011 00 01 ; -> $0100

lda #%00000001
sta $0102

lda #%00000011
ldy #$02
and ($11),y
ldy #$06
debg
.debug A=01