; immediate
lda #%00000101
eor #%00000011
ldy #$00
debg ; a=6

; zero page
lda #%00000011
sta $0010
lda #%00000101
eor $10
ldy #$01
debg ; a=6
debg $0010 ; 3

; zero page X
ldx #$01
lda #%00000011
sta $0011
lda #%00000101
eor $10,x
ldy #$02
debg ; a=6
debg $0011 ; 3

; absolute
lda #%00000011
sta $0100
lda #%00000101
eor $0100
ldy #$03
debg ; a=6

; absolute X
ldx #$01
lda #%00000011
sta $0111
lda #%00000101
eor $0110,x
ldy #$04
debg ; a=6
debg $0111 ; 3

; absolute X
ldx #$01
lda #%00000011
sta $0111
lda #%00000101
eor $0110,x
ldy #$05
debg ; a=6
debg $0111 ; 3

; indexed indiret X
lda #$00
sta $0011
lda #$01
sta $0012
; 0011 00 01 ; -> $0100

lda #%00000101
sta $0100

lda #%00000011
ldx #$01
eor ($10,x)
ldy #$06
debg ; a=6

; indirect indexed Y
lda #$00
sta $0011
lda #$01
sta $0012
; 0011 00 01 ; -> $0100

lda #%00000101
sta $0101

lda #%00000011
ldy #$01
eor ($11),y
ldy #$07
debg ; a=3
