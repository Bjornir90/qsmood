<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-ignore*/
import VueChart from 'vue-chartjs'
import {
    Component,
    Prop,
    Vue
} from 'vue-property-decorator';
import Chart from 'chart.js';
import { mixins } from 'vue-class-component';

//@ts-ignore
@Component({
    extends: VueChart.Line,
    mixins: [VueChart.mixins.reactiveProp]
})


class LineChart extends Vue<VueChart.Line> {

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