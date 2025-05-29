
public class texte_wpm {

    public texte_wpm() {
        String txt = "Parafuso e fluído em lugar de articulação Até achava que aqui batia um coração Nada é orgânico, é tudo programado E eu achando que tinha me libertado";
        // Valor definido pessoal do WPM - Word per Minutes(Palavras por minutos)
        double wpm = 180;
        resultado_wpm(txt, wpm);
    }

    double wpm_pessoal(double tempo_coment, String texto){
        double wpm = total_palavras(texto) / tempo_coment;
        return wpm;
    }

    int total_palavras(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return 0;
        }

        String[] palavras = texto.trim().split("\\s");

        return palavras.length;

    }

    void resultado_wpm(String texto, double wpm) {
        int n_palavras = total_palavras(texto);
        
        double tempoMinutos = wpm_pessoal(wpm, texto);
        double tempoSegundos = tempoMinutos * 60;

        System.out.println("\n -- Resultados --");
        System.out.println("Total de palavras: " + n_palavras);
        System.out.printf("Tempo estimado de fala: %.2f minutos (%.0f segundos)\n", tempoMinutos, tempoSegundos);
    }

    public static void main(String[] args) {
        new texte_wpm();
    }

}
