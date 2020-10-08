sei

; top left
lda #$80
sta $1300

; bottom right
lda #$01
sta $32ff

; top right
lda #$01
sta $13f8

; bottom left
lda #$80
sta $3207

lda #$ff
ldx #$00
[draw]
sta $2200,x
inx
bnej [draw] ; loop until z flag is set, meaning we wrapped around to 0

brk
