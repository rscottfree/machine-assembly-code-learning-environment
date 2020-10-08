lda #%11111111
pha
lda #%10101010
pha
plp
debg
debg $01f8

brk


lda #%11111111
pha
lda #%01010101
pha
lda #$de
cmp #$de
pha
php
php
pla
debg $01f8
debg
