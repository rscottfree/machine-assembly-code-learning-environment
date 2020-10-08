; immediate
lda #%00000001
rol
;debg ; a=2 c=0

; with carry
lda #%10000001
rol
;debg ; a=3 c=1

; zero page
lda #$81
sta $0010
rol $10
;debg ; c=0
;debg $0010 ; 03

; zero page x
lda #$81 ; 129
sta $0011
ldx #$01
rol $10,x
;debg ; c=1 x=1
;debg $0011 ; 03

; absolute
lda #$82
sta $2000
rol $2000
;debg ; c=1
;debg $2000 ; 05

; absolute x
lda #$81
sta $2002
ldx #$02
rol $2000,x
debg ; c=1 x=2
debg $2002 ; 03