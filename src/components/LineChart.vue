<script lang="ts">
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

@Component({
    extends: Line
})


export default class LineChart extends Line {

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
</script>