*= $e000

; zero page variables ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; $08-$0f is working space for kernal routines
[cursor-location]= $02 ; $02-$03
[cursor-location-2]= $03
[cursor-on]= $04
[cursor-x]= $05
[cursor-y]= $06
[kernal-workspace]= $08 ; $08-$0f
[key-buffer]= $10
[key-buffer-count]= $1a


; variables ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
[irq-pointer]= $fffe
[irq-routine]= $f000
[chars-start]= $0300
[video-mem]= $0b00

; jmp to start of code to execute ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
jmp [kernal-start]

; define routines ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;----------------------
; print a character
[print-char]
; save
sta [kernal-workspace]
txa
pha
lda [kernal-workspace]

cmp #$13
bnej [print-char-visible]
jsr [carriage-return]
jmp [print-char-restore]

[print-char-visible]
ldx #$00
sta ([cursor-location],x)

; restore
[print-char-restore]
lda [kernal-workspace]
pla
tax
lda [kernal-workspace]
rts

;----------------------------------
; Add one to cursor-location value
[advance-cursor]
clc
lda #$01
adc [cursor-location]
sta [cursor-location]
bccj [advance-cursor-xy]
lda #$01
adc [cursor-location-2]
sta [cursor-location-2]

[advance-cursor-xy]
clc
lda #$01
adc [cursor-x]
sta [cursor-x]
cmp #$20
bnej [advance-cursor-check-y]
lda #$00
sta [cursor-x]

[advance-cursor-check-y]
clc
lda #$01
adc [cursor-y]
sta [cursor-y]
cmp #$20
bnej [advance-cursor-end]
lda #$00
sta [cursor-y]

[advance-cursor-end]
rts

;--------------------------
; Draw cursor
[draw-cursor]
sta [kernal-workspace]
lda [cursor-on]
cmp #$09 ; about halfway between a full on/off cycle
bcsj [draw-cursor-off]
lda #$80
jsr [print-char]
jmp [draw-cursor-inc]

[draw-cursor-off]
lda #$20
jsr [print-char]

[draw-cursor-inc]
lda [cursor-on]
cmp #$10 ; total on/off cycle time
bnej [draw-cursor-end]
lda #$00
sta [cursor-on]

[draw-cursor-end]
inc [cursor-on]
;.debug inc
;.debug $0004
lda [kernal-workspace]
rts

;-----------------------------
[handle-key-buf]
lda [key-buffer-count]
beqj [handle-key-buf-done]
tax
dex
lda [key-buffer],x
stx [key-buffer-count]

cmp #$0d ; check if return key
beqj [handle-key-buf-return]

jsr [print-char]
jsr [advance-cursor]
jmp [handle-key-buf]

[handle-key-buf-return]
jsr [carriage-return]
jmp [handle-key-buf]

[handle-key-buf-done]
rts

;-----------------------------
; carriage-return
[carriage-return]
lda #$20
jsr [print-char]

sec
lda #$20
sbc [cursor-x]

tax
[carriage-return-advance]
jsr [advance-cursor]
dex
bnej [carriage-return-advance]
rts

;--------------------
; print ready
[print-ready]
lda #$52
jsr [print-char]
jsr [advance-cursor]
lda #$45
jsr [print-char]
jsr [advance-cursor]
lda #$41
jsr [print-char]
jsr [advance-cursor]
lda #$44
jsr [print-char]
jsr [advance-cursor]
lda #$59
jsr [print-char]
jsr [advance-cursor]
lda #$2e
jsr [print-char]
jsr [advance-cursor]
lda #$13
jsr [print-char]
rts



; setup memory ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
*= [cursor-location]
.byte $00 $0b
*= [cursor-x]
.byte $00
*= [cursor-y]
.byte $00



; setup IRQ ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; (routine needs to be setup with static address so cpu can call into it)
*= [irq-pointer]
.byte $00 $f0 ; irq-routine

*= [irq-routine]
; need to save all the registers (A/X/Y) onto the stack
pha
txa
pha
tya
pha

; routine
;.debug irq
jsr [draw-cursor]
jsr [handle-key-buf]

; need to restore registers from stack and return
pla
tay
pla
tax
pla
rti


; start of kernal routine
[kernal-start]
jsr [print-ready]
ldx #$00
[start-here]
jmp [start-here]


;bnej [start-here]
;lda #$80
;jsr [print-char]
;[here]
;lda #$01
;lda #$02
;bra %11111100 ; -4
;brk
