; immediate
lda #%00000001
ror
debg ; a=80 c=1

; with carry
lda #%10000001
ror
debg ; a=c0 c=1

; zero page
lda #$81
sta $0010
ror $10
debg ; c=1
debg $0010 ; c0

; zero page x
lda #$81 ; 129
sta $0011
ldx #$01
ror $10,x
debg ; c=1 x=1
debg $0011 ; c0

; absolute
lda #$82
sta $2000
ror $2000
debg ; c=0
debg $2000 ; 41

; absolute x
lda #$81
sta $2002
ldx #$02
ror $2000,x
debg ; c=1 x=2
debg $2002 ; c0