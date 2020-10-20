<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-ignore*/
import {Line, mixins} from 'vue-chartjs'
import {
    Component,
    Prop,
    Vue
} from 'vue-property-decorator';
import Chart from 'chart.js';

//@ts-ignore
@Component({
    extends: Line,
    mixins: [mixins.reactiveProp]
})


class LineChart extends Vue<Line> {

    @Prop({ required: false, default: {} })
    public options!: Chart.ChartOptions;

    private Chart!: Chart;

    mounted () {
        //@ts-ignore
        this.renderChart(this.chartData, this.options);
        this.Chart = this.$data._chart;
    }
}

export default LineChart;
</script>