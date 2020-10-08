; zero page
ldx #%11000000
lda #%00000000
stx $10
bit $10
debg ; N=1 V=1 Z=1

; absolute
ldx #%10100000
lda #%00100000
stx $2000
bit $2000
debg ; N=1 V=0 Z=0