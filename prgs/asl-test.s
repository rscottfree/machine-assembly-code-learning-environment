; immediate
lda #%00000001
asl
;debg ; a=2 c=0

; with carry
lda #%10000001
asl
;debg ; a=2 c=1

; zero page
lda #$01
sta $0010
asl $10
;debg ; c=0
;debg $0010 ; 02

; zero page x
lda #$81 ; 129
sta $0011
ldx #$01
asl $10,x
;debg ; c=1 x=1
;debg $0011 ; 02

; absolute
lda #$82
sta $2000
asl $2000
;debg ; c=1
;debg $2000 ; 04

; absolute x
lda #$81
sta $2002
ldx #$02
asl $2000,x
debg ; c=1 x=2
debg $2002 ; 02