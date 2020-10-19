<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-ignore*/
import {Line} from 'vue-chartjs'
import {
  Component,
  Prop,
  Vue,
  Watch,
  Mixins,
  Emit
} from 'vue-property-decorator';
import Chart from 'chart.js';

/*interface LineChart extends Vue {
    renderChart(data: Chart.ChartData, options?: Chart.ChartOptions): void;
}
*/

//@ts-ignore
@Component({
    extends: Line
})


class LineChart extends Vue<Line> {

    @Prop({ required: true, default: {} })
    public chartData!: Chart.ChartData;

    private options: Chart.ChartOptions = {};

    private Chart!: Chart;

    mounted () {
        //this.applyDefaultOptions();
        this.renderChart(this.chartData);
        this.Chart = this.$data._chart;
    }


   /* private applyDefaultOptions() {
            this.options.scales = {
                xAxes: [
                    {
                    type: "time",
                    time: {
                        unit: "week",
                        displayFormats : {
                            week: 'YYYY-MM-DD'
                        }
                    }
                    }
                ],
                yAxes: []
            };
    }*/
}

export default LineChart;
</script>