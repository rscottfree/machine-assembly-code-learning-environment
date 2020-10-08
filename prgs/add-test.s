clc
lda #$01
adc #$02
debg
.debug A = $03
clc
lda #$ff
adc #$02
debg
.debug A = $01, C = 1
clc
lda #$03
sta $0010
lda #$ff
adc $0010
debg
.debug A = $02, C = 1
brk
